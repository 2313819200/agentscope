/**
 * OpenClaw Agent Monitor 适配器
 *
 * 监听 OpenClaw Gateway 的事件流，实时展示 agent 会话、token 消耗、工具调用等。
 * 通过 Vite proxy (/api/openclaw -> http://localhost:1177) 连接。
 */

import type { AgentMonitorConfig, AgentSession, ToolCall } from '../types';
import { generateId } from './index';

export const OPENCLAW_CONFIG: AgentMonitorConfig = {
  id: 'openclaw',
  name: 'OpenClaw',
  endpoint: '/api/openclaw',
  wsEndpoint: undefined, // 先走 REST polling + 心跳
  color: '#f43f5e',
  icon: '🐙',
};

export interface OpenClawEvent {
  type: 'session_start' | 'session_update' | 'token_usage' | 'tool_call' | 'error';
  sessionId?: string;
  agentId?: string;
  agentName?: string;
  model?: string;
  content?: string;
  tokens?: { input: number; output: number };
  tool?: ToolCall;
  timestamp: number;
}

export type OpenClawListener = (event: OpenClawEvent) => void;

/**
 * OpenClaw 监视器客户端
 * 连接到本地 OpenClaw Gateway 并实时推送事件
 */
export class OpenClawMonitor {
  private ws: WebSocket | null = null;
  private listeners: Set<OpenClawListener> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private sessions: Map<string, AgentSession> = new Map();

  connect(url: string) {
    // 先尝试 WebSocket
    const wsUrl = url.replace(/^http/, 'ws') + '/events';
    this.connectWs(wsUrl);
  }

  private connectWs(url: string) {
    try {
      this.ws = new WebSocket(url);
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleEvent(data);
        } catch {
          // skip
        }
      };
      this.ws.onclose = () => {
        this.scheduleReconnect(url);
      };
      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect(url);
    }
  }

  private scheduleReconnect(url: string) {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectWs(url);
    }, 5000);
  }

  private handleEvent(data: Record<string, unknown>) {
    const event: OpenClawEvent = {
      type: (data.type as OpenClawEvent['type']) ?? 'session_update',
      timestamp: Date.now(),
      ...data,
    };

    // 更新内部状态
    if (event.sessionId) {
      let session = this.sessions.get(event.sessionId);
      if (!session) {
        session = {
          id: event.sessionId,
          agentId: event.agentId ?? 'unknown',
          agentName: event.agentName ?? 'Agent',
          status: 'running',
          model: event.model ?? 'unknown',
          startedAt: event.timestamp,
          updatedAt: event.timestamp,
          messages: [],
          tools: [],
        };
        this.sessions.set(event.sessionId, session);
      } else {
        session.updatedAt = event.timestamp;
        if (event.tokens) {
          session.tokenUsage = {
            input: (session.tokenUsage?.input ?? 0) + (event.tokens.input ?? 0),
            output: (session.tokenUsage?.output ?? 0) + (event.tokens.output ?? 0),
            total:
              (session.tokenUsage?.total ?? 0) +
              (event.tokens.input ?? 0) +
              (event.tokens.output ?? 0),
          };
        }
        if (event.tool) {
          session.tools.push(event.tool);
        }
      }
    }

    // 通知监听器
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  onEvent(listener: OpenClawListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSessions() {
    return Array.from(this.sessions.values());
  }

  getSession(id: string) {
    return this.sessions.get(id);
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.listeners.clear();
  }
}

export const openclawMonitor = new OpenClawMonitor();
