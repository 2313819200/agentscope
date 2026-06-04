import { useState } from 'react';
import { useStore } from '../store';
import { AVAILABLE_MODELS } from '../providers/index';
import type { ModelId } from '../types';

const tabs = [
  { id: 'chat' as const, label: 'Chat', icon: '💬' },
  { id: 'monitor' as const, label: 'Monitor', icon: '📡' },
  { id: 'graph' as const, label: 'Graph', icon: '🕸️' },
  { id: 'settings' as const, label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const selectedModel = useStore((s) => s.selectedModel);
  const setSelectedModel = useStore((s) => s.setSelectedModel);
  const selectedModelName = useStore((s) => s.selectedModelName);
  const setApiKey = useStore((s) => s.setApiKey);
  const apiKeys = useStore((s) => s.apiKeys);
  const startChat = useStore((s) => s.startChat);
  const clearChat = useStore((s) => s.clearChat);
  const monitorConnected = useStore((s) => s.monitorConnected);
  const connectMonitor = useStore((s) => s.connectMonitor);
  const disconnectMonitor = useStore((s) => s.disconnectMonitor);
  const streaming = useStore((s) => s.streaming);

  return (
    <aside className="w-64 bg-surface-raised border-r border-gray-800/50 flex flex-col shrink-0">
      {/* 模型选择器 */}
      <div className="p-3 border-b border-gray-800/50">
        <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
          Models
        </div>
        <div className="space-y-1.5">
          {AVAILABLE_MODELS.map((model) => (
            <div key={model.id}>
              <button
                onClick={() => {
                  setSelectedModel(model.id, model.models[0]);
                  if (selectedModel !== model.id) startChat(model.id, model.models[0]);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-all ${
                  selectedModel === model.id
                    ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-surface-overlay/50'
                }`}
              >
                <span>{model.icon}</span>
                <span className="flex-1 text-left">{model.name}</span>
                {apiKeys[model.id] && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                )}
              </button>
              {selectedModel === model.id && (
                <div className="ml-6 mt-1 mb-1 space-y-1">
                  {model.models.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedModel(model.id, m)}
                      className={`block w-full text-left px-2 py-1 rounded text-xs transition ${
                        selectedModelName === m
                          ? 'text-accent-green bg-accent-green/5'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 导航 Tab */}
      <div className="p-3 border-b border-gray-800/50">
        <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
          Navigation
        </div>
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-overlay/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'monitor' && monitorConnected && (
                <span className="ml-auto flex items-center gap-1 text-xs text-accent-green">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                  Live
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="p-3 flex-1">
        <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
          Actions
        </div>
        <div className="space-y-1">
          <button
            onClick={() => connectMonitor()}
            disabled={monitorConnected}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-surface-overlay/50 transition-all disabled:opacity-30"
          >
            <span>🔌</span>
            <span>{monitorConnected ? 'Connected' : 'Connect Monitor'}</span>
          </button>
          <button
            onClick={() => disconnectMonitor()}
            disabled={!monitorConnected}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-surface-overlay/50 transition-all disabled:opacity-30"
          >
            <span>⏹️</span>
            <span>Disconnect</span>
          </button>
          <button
            onClick={() => clearChat()}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <span>🗑️</span>
            <span>Clear Chat</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
