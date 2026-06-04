import type {
  ModelConfig,
  ModelId,
  StreamChunk,
  ChatMessage,
  ChatRequest,
} from '../types';

// ──── Provider interface ────

export interface ModelProvider {
  id: ModelId;
  config: ModelConfig;
  chat(req: ChatRequest, apiKey: string): AsyncGenerator<StreamChunk>;
  validateKey(apiKey: string): boolean;
  estimateCost(usage: { input: number; output: number }): {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  };
}

// ──── 所有已注册的模型 ────

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    apiKeyRequired: true,
    models: ['claude-sonnet-4-20250514', 'claude-haiku-3-5-20241022'],
    color: '#d97706',
    icon: '🧠',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'DeepSeek',
    apiKeyRequired: true,
    baseUrl: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    color: '#10b981',
    icon: '🐋',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    provider: 'OpenAI',
    apiKeyRequired: true,
    models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini', 'gpt-4.1'],
    color: '#3b82f6',
    icon: '⚡',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    provider: 'Google',
    apiKeyRequired: true,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-2.0-flash', 'gemini-2.5-flash-preview-04-17'],
    color: '#8b5cf6',
    icon: '✨',
  },
];

// ──── 构建 Chat 请求 ────

export function buildMessages(
  history: ChatMessage[],
  newContent: string,
  systemPrompt?: string
): { role: string; content: string }[] {
  const msgs: { role: string; content: string }[] = [];
  if (systemPrompt) {
    msgs.push({ role: 'system', content: systemPrompt });
  }
  for (const m of history) {
    msgs.push({ role: m.role, content: m.content });
  }
  msgs.push({ role: 'user', content: newContent });
  return msgs;
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
}
