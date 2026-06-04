import { create } from 'zustand';
import type {
  ChatMessage,
  AgentSession,
  Tab,
  AppSettings,
  TokenUsage,
  ModelId,
  AgentMonitorConfig,
} from '../types';
import { generateId, buildMessages } from '../providers/index';
import { claudeProvider } from '../providers/claude';
import { deepseekProvider } from '../providers/deepseek';
import { openaiProvider } from '../providers/openai';
import { geminiProvider } from '../providers/gemini';
import { openclawMonitor } from '../providers/openclaw';

// ──── Provider 注册表 ────

const providers = {
  claude: claudeProvider,
  deepseek: deepseekProvider,
  openai: openaiProvider,
  gemini: geminiProvider,
} as const;

// ──── Key 管理 ────

function loadApiKeys(): Record<ModelId, string> {
  try {
    const raw = localStorage.getItem('agentscope_api_keys');
    return raw ? JSON.parse(raw) : {} as Record<ModelId, string>;
  } catch {
    return {} as Record<ModelId, string>;
  }
}

function saveApiKeys(keys: Record<ModelId, string>) {
  localStorage.setItem('agentscope_api_keys', JSON.stringify(keys));
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('agentscope_settings');
    return raw
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem('agentscope_settings', JSON.stringify(settings));
}

// ──── 默认值 ────

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  autoScroll: true,
  maxHistoryMessages: 100,
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: '',
};

// ──── Store 类型 ────

interface AgentScopeState {
  // 当前标签
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;

  // 聊天相关
  chats: Record<string, ChatMessage[]>;
  currentChatId: string | null;
  streaming: boolean;
  streamContent: string;

  startChat: (modelId: ModelId, modelName: string) => void;
  sendMessage: (content: string) => Promise<void>;
  stopStream: () => void;
  clearChat: () => void;

  // 模型配置
  selectedModel: ModelId;
  selectedModelName: string;
  setSelectedModel: (id: ModelId, name: string) => void;

  apiKeys: Record<ModelId, string>;
  setApiKey: (id: ModelId, key: string) => void;
  hasValidKey: (id: ModelId) => boolean;

  // 监控相关
  monitorConnected: boolean;
  monitorSessions: AgentSession[];
  monitorConfigs: AgentMonitorConfig[];
  connectMonitor: () => void;
  disconnectMonitor: () => void;

  // Token 统计
  totalTokens: TokenUsage;
  addTokens: (usage: TokenUsage) => void;

  // 设置
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;

  // 总花费
  totalCost: number;
  addTotalCost: (cost: number) => void;
}

export const useStore = create<AgentScopeState>((set, get) => ({
  // ──── Tab ────
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ──── 聊天 ────
  chats: {},
  currentChatId: null,
  streaming: false,
  streamContent: '',

  selectedModel: 'claude',
  selectedModelName: 'claude-sonnet-4-20250514',

  setSelectedModel: (id, name) => set({ selectedModel: id, selectedModelName: name }),

  apiKeys: loadApiKeys(),
  setApiKey: (id, key) => {
    const keys = { ...get().apiKeys, [id]: key };
    set({ apiKeys: keys });
    saveApiKeys(keys);
  },
  hasValidKey: (id) => {
    const key = get().apiKeys[id];
    return !!key && providers[id]?.validateKey(key);
  },

  startChat: (modelId, modelName) => {
    const chatId = generateId();
    set({
      currentChatId: chatId,
      chats: { ...get().chats, [chatId]: [] },
      selectedModel: modelId,
      selectedModelName: modelName,
      activeTab: 'chat',
    });
  },

  sendMessage: async (content) => {
    const { currentChatId, chats, selectedModel, selectedModelName, apiKeys, settings } = get();
    const chatId = currentChatId ?? generateId();
    const key = apiKeys[selectedModel];
    if (!key) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const history = chats[chatId] ?? [];
    const updatedChats = {
      ...chats,
      [chatId]: [...history, userMsg],
    };

    set({
      currentChatId: chatId,
      chats: updatedChats,
      streaming: true,
      streamContent: '',
    });

    const provider = providers[selectedModel];
    if (!provider) return;

    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      model: selectedModelName,
      timestamp: Date.now(),
    };

    let fullContent = '';
    let totalInput = 0;
    let totalOutput = 0;

    try {
      const req = {
        model: selectedModelName,
        messages: buildMessages(history, content, settings.systemPrompt),
        stream: true,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        system: settings.systemPrompt,
      };

      for await (const chunk of provider.chat(req, key)) {
        if (chunk.type === 'text') {
          fullContent += chunk.content;
          set({ streamContent: fullContent });
        } else if (chunk.type === 'thinking') {
          // Optionally show thinking in UI
        } else if (chunk.type === 'error') {
          fullContent += `\n\n[Error] ${chunk.content}`;
          set({ streamContent: fullContent });
          break;
        } else if (chunk.type === 'done' && chunk.metadata?.usage) {
          const u = chunk.metadata.usage as TokenUsage;
          totalInput = u.input ?? 0;
          totalOutput = u.output ?? 0;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      fullContent += `\n\n[Error] ${msg}`;
      set({ streamContent: fullContent });
    }

    assistantMsg.content = fullContent;
    if (totalInput || totalOutput) {
      const cost = provider.estimateCost({ input: totalInput, output: totalOutput });
      assistantMsg.tokenUsage = {
        input: totalInput,
        output: totalOutput,
        total: totalInput + totalOutput,
        ...cost,
      };
      get().addTokens({
        input: totalInput,
        output: totalOutput,
        total: totalInput + totalOutput,
      });
      get().addTotalCost(cost.totalCost);
    }

    const finalChats = {
      ...get().chats,
      [chatId]: [...(get().chats[chatId] ?? []), assistantMsg],
    };

    set({
      chats: finalChats,
      streaming: false,
      streamContent: '',
    });
  },

  stopStream: () => {
    set({ streaming: false });
  },

  clearChat: () => {
    set({ chats: {}, currentChatId: null });
  },

  // ──── 监控 ────
  monitorConnected: false,
  monitorSessions: [],
  monitorConfigs: [
    {
      id: 'openclaw',
      name: 'OpenClaw',
      endpoint: '/api/openclaw',
      color: '#f43f5e',
      icon: '🐙',
    },
    {
      id: 'hermes',
      name: 'Hermes Agent',
      endpoint: '/api/hermes',
      color: '#8b5cf6',
      icon: '🔮',
    },
    {
      id: 'custom',
      name: '自定义 Agent',
      endpoint: '',
      color: '#10b981',
      icon: '🤖',
    },
  ],

  connectMonitor: () => {
    openclawMonitor.connect('/api/openclaw');
    const unsubscribe = openclawMonitor.onEvent((event) => {
      set({
        monitorSessions: openclawMonitor.getSessions(),
        monitorConnected: true,
      });
      // Track token usage
      if (event.tokens) {
        get().addTokens({
          input: event.tokens.input,
          output: event.tokens.output,
          total: event.tokens.input + event.tokens.output,
        });
      }
    });
    set({ monitorConnected: true });
  },

  disconnectMonitor: () => {
    openclawMonitor.disconnect();
    set({ monitorConnected: false, monitorSessions: [] });
  },

  // ──── Token ────
  totalTokens: { input: 0, output: 0, total: 0 },
  totalCost: 0,

  addTokens: (usage) => {
    const prev = get().totalTokens;
    set({
      totalTokens: {
        input: prev.input + (usage.input ?? 0),
        output: prev.output + (usage.output ?? 0),
        total: prev.total + (usage.total ?? 0),
      },
    });
  },

  addTotalCost: (cost: number) => {
    set({ totalCost: +(get().totalCost + cost).toFixed(6) });
  },

  // ──── 设置 ────
  settings: loadSettings(),

  updateSettings: (patch) => {
    const newSettings = { ...get().settings, ...patch };
    set({ settings: newSettings });
    saveSettings(newSettings);
  },
}));

