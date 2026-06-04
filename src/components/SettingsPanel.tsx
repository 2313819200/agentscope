import { useState } from 'react';
import { useStore } from '../store';
import { AVAILABLE_MODELS } from '../providers/index';
import type { ModelId } from '../types';

export function SettingsPanel() {
  const apiKeys = useStore((s) => s.apiKeys);
  const setApiKey = useStore((s) => s.setApiKey);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const hasValidKey = useStore((s) => s.hasValidKey);

  const [showKeys, setShowKeys] = useState(false);
  const [editKeys, setEditKeys] = useState<Record<string, string>>({ ...apiKeys });

  const saveKey = (id: ModelId) => {
    const key = editKeys[id]?.trim() ?? '';
    setApiKey(id, key);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scroll">
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* ███ API Keys ███ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <span>🔑</span> API Keys
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Keys are stored in your browser's localStorage. Never shared anywhere.
          </p>

          <div className="space-y-3">
            {AVAILABLE_MODELS.map((model) => (
              <div
                key={model.id}
                className="bg-surface-overlay border border-gray-800/50 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{model.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-200">{model.name}</div>
                    <div className="text-xs text-gray-500">{model.provider}</div>
                  </div>
                  {hasValidKey(model.id) ? (
                    <span className="text-xs text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-full">
                      ✅ Valid
                    </span>
                  ) : editKeys[model.id] ? (
                    <span className="text-xs text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded-full">
                      ⚠️ Not tested
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600 bg-gray-800/50 px-2 py-0.5 rounded-full">
                      Not set
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type={showKeys ? 'text' : 'password'}
                    value={editKeys[model.id] ?? ''}
                    onChange={(e) =>
                      setEditKeys({ ...editKeys, [model.id]: e.target.value })
                    }
                    placeholder={`${model.name} API Key (sk-...)`}
                    className="flex-1 bg-surface border border-gray-700/50 rounded-lg px-3 py-2 text-xs text-gray-100 placeholder-gray-600 outline-none focus:border-accent-blue/50"
                  />
                  <button
                    onClick={() => saveKey(model.id)}
                    className="px-3 py-2 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue rounded-lg text-xs transition-all"
                  >
                    Save
                  </button>
                </div>

                <div className="mt-2 text-[10px] text-gray-600">
                  Supported: {model.models.join(', ')}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowKeys(!showKeys)}
            className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showKeys ? '🙈 Hide keys' : '👁️ Show keys'}
          </button>
        </section>

        {/* ███ OpenClaw ███ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <span>🐙</span> OpenClaw Gateway
          </h2>
          <div className="bg-surface-overlay border border-gray-800/50 rounded-xl p-4 space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Endpoint</label>
              <input
                value="http://localhost:1177"
                disabled
                className="w-full bg-surface border border-gray-700/50 rounded-lg px-3 py-2 text-xs text-gray-400 outline-none"
              />
              <p className="text-[10px] text-gray-600 mt-1">
                Default local OpenClaw Gateway endpoint
              </p>
            </div>
          </div>
        </section>

        {/* ███ 通用设置 ███ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <span>⚙️</span> General Settings
          </h2>
          <div className="bg-surface-overlay border border-gray-800/50 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Temperature</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => updateSettings({ temperature: +e.target.value })}
                  className="w-24 accent-accent-blue"
                />
                <span className="text-xs font-mono text-gray-400 w-8 text-right">
                  {settings.temperature.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Max Tokens</label>
              <input
                type="number"
                value={settings.maxTokens}
                onChange={(e) => updateSettings({ maxTokens: +e.target.value })}
                className="w-20 bg-surface border border-gray-700/50 rounded px-2 py-1 text-xs text-gray-100 text-center outline-none"
                min={1}
                max={128000}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Auto-scroll</label>
              <input
                type="checkbox"
                checked={settings.autoScroll}
                onChange={(e) => updateSettings({ autoScroll: e.target.checked })}
                className="accent-accent-blue"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 block mb-1">System Prompt</label>
              <textarea
                value={settings.systemPrompt}
                onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
                placeholder="Optional: set a system prompt for all conversations..."
                rows={3}
                className="w-full bg-surface border border-gray-700/50 rounded-lg px-3 py-2 text-xs text-gray-100 placeholder-gray-600 outline-none focus:border-accent-blue/50 resize-none"
              />
            </div>
          </div>
        </section>

        {/* 底部说明 */}
        <div className="text-center text-[10px] text-gray-600 pb-8 space-y-1">
          <p>AgentScope · 观星台 · All data stays in your browser</p>
          <p>
            <a
              href="https://github.com/your-repo/agentscope"
              className="hover:text-gray-400 transition-colors"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
