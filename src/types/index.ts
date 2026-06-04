/** AgentScope 核心类型定义 */

// ──── 模型 Provider ────

export type ModelId = 'claude' | 'deepseek' | 'openai' | 'gemini';

export interface ModelConfig {
  id: ModelId;
  name: string;
  provider: string;
  apiKeyRequired: boolean;
  baseUrl?: string;
  models: string[];
  color: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  timestamp: number;
  tokenUsage?: TokenUsage;
  metadata?: Record<string, unknown>;
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
  inputCost?: number;
  outputCost?: number;
  totalCost?: number;
}

export interface StreamChunk {
  type: 'text' | 'thinking' | 'tool_call' | 'tool_result' | 'error' | 'done';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ChatRequest {
  model: string;
  messages: { role: string; content: string }[];
  stream?: boolean;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

// ──── Agent 监控 ────

export type AgentMonitorId = 'openclaw' | 'hermes' | 'custom';

export interface AgentMonitorConfig {
  id: AgentMonitorId;
  name: string;
  endpoint: string;
  wsEndpoint?: string;
  apiKey?: string;
  color: string;
  icon: string;
}

export interface AgentSession {
  id: string;
  agentId: string;
  agentName: string;
  status: 'running' | 'idle' | 'error' | 'completed';
  model: string;
  startedAt: number;
  updatedAt: number;
  messages: AgentMessage[];
  tokenUsage?: TokenUsage;
  tools: ToolCall[];
  tags?: string[];
}

export interface AgentMessage {
  id: string;
  role: string;
  content: string;
  timestamp: number;
  type: 'text' | 'tool_call' | 'tool_result' | 'thinking' | 'error';
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
  result?: string;
  status: 'pending' | 'running' | 'success' | 'error';
  startedAt: number;
  completedAt?: number;
  duration?: number;
}

// ──── 可视化 ────

export interface GraphNode {
  id: string;
  type: 'model' | 'agent' | 'tool' | 'user' | 'system';
  label: string;
  data: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'message' | 'tool_call' | 'monitor';
}

// ──── 应用状态 ────

export type Tab = 'chat' | 'monitor' | 'graph' | 'settings';

export interface AppSettings {
  theme: 'dark' | 'light';
  autoScroll: boolean;
  maxHistoryMessages: number;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}
