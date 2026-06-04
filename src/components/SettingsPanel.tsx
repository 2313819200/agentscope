import { useState } from 'react';
import { useStore } from '../store';
import { AVAILABLE_MODELS } from '../providers/index';
import { useI18n } from '../i18n/index';
import { useTheme } from '../theme';
import type { ModelId } from '../types';

export function SettingsPanel() {
  const apiKeys = useStore((s) => s.apiKeys);
  const setApiKey = useStore((s) => s.setApiKey);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const hasValidKey = useStore((s) => s.hasValidKey);
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();

  const [showKeys, setShowKeys] = useState(false);
  const [editKeys, setEditKeys] = useState<Record<string, string>>({ ...apiKeys });

  const saveKey = (id: ModelId) => {
    const key = editKeys[id]?.trim() ?? '';
    setApiKey(id, key);
  };

  const sectionTitle = (icon: string, label: string) => (
    <h2 className="text-base font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
      <span>{icon}</span> {label}
    </h2>
  );

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-strong)',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '12px',
    outline: 'none',
    width: '100%',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-overlay)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scroll">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* ███ API Keys ███ */}
        <section>
          {sectionTitle('🔑', t('settings.api_keys'))}
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>{t('settings.key_hint')}</p>
          <div className="space-y-3">
            {AVAILABLE_MODELS.map((model) => (
              <div key={model.id} style={cardStyle}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{model.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {model.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-dim)' }}>{model.provider}</div>
                  </div>
                  {hasValidKey(model.id) ? (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--accent-green)', background: 'color-mix(in srgb, var(--accent-green) 10%, transparent)' }}>
                      ✅ {t('settings.valid')}
                    </span>
                  ) : editKeys[model.id] ? (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--accent-amber)', background: 'color-mix(in srgb, var(--accent-amber) 10%, transparent)' }}>
                      ⚠️ {t('settings.not_tested')}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--text-dim)', background: 'color-mix(in srgb, var(--bg-surface) 50%, transparent)' }}>
                      {t('settings.not_set')}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type={showKeys ? 'text' : 'password'}
                    value={editKeys[model.id] ?? ''}
                    onChange={(e) => setEditKeys({ ...editKeys, [model.id]: e.target.value })}
                    placeholder={`${model.name} API Key`}
                    style={inputStyle}
                  />
                  <button
                    onClick={() => saveKey(model.id)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{ background: 'color-mix(in srgb, var(--accent-blue) 15%, transparent)', color: 'var(--accent-blue)' }}
                  >
                    {t('settings.save')}
                  </button>
                </div>
                <div className="mt-1.5 text-[10px]" style={{ color: 'var(--text-dim)' }}>
                  {t('settings.supported')}: {model.models.join(', ')}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="mt-2 text-xs transition-colors"
            style={{ color: 'var(--text-dim)' }}
          >
            {showKeys ? `🙈 ${t('settings.hide_keys')}` : `👁️ ${t('settings.show_keys')}`}
          </button>
        </section>

        {/* ███ 语言 + 主题 ███ */}
        <section>
          {sectionTitle('🎨', t('settings.general'))}
          <div style={cardStyle} className="space-y-4">
            {/* 语言 */}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('settings.language')}</span>
              <div className="flex gap-1">
                {(['zh', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className="px-3 py-1 rounded-lg text-xs transition-all"
                    style={{
                      background: lang === l ? 'color-mix(in srgb, var(--accent-blue) 15%, transparent)' : 'transparent',
                      color: lang === l ? 'var(--accent-blue)' : 'var(--text-dim)',
                      border: lang === l ? '1px solid color-mix(in srgb, var(--accent-blue) 30%, transparent)' : '1px solid transparent',
                      fontWeight: lang === l ? 600 : 400,
                    }}
                  >
                    {l === 'zh' ? '中文' : 'English'}
                  </button>
                ))}
              </div>
            </div>

            {/* 主题 */}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('settings.theme')}</span>
              <div className="flex gap-1">
                {(['dark', 'light'] as const).map((th) => (
                  <button
                    key={th}
                    onClick={() => setTheme(th)}
                    className="px-3 py-1 rounded-lg text-xs transition-all"
                    style={{
                      background: theme === th ? 'color-mix(in srgb, var(--accent-blue) 15%, transparent)' : 'transparent',
                      color: theme === th ? 'var(--accent-blue)' : 'var(--text-dim)',
                      border: theme === th ? '1px solid color-mix(in srgb, var(--accent-blue) 30%, transparent)' : '1px solid transparent',
                      fontWeight: theme === th ? 600 : 400,
                    }}
                  >
                    {th === 'dark' ? `🌙 ${t('settings.dark')}` : `☀️ ${t('settings.light')}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature */}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('settings.temperature')}</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => updateSettings({ temperature: +e.target.value })}
                  className="w-20"
                  style={{ accentColor: 'var(--accent-blue)' }}
                />
                <span className="text-xs font-mono w-8 text-right" style={{ color: 'var(--text-muted)' }}>
                  {settings.temperature.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Max Tokens */}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('settings.max_tokens')}</span>
              <input
                type="number"
                value={settings.maxTokens}
                onChange={(e) => updateSettings({ maxTokens: +e.target.value })}
                className="w-20 text-xs text-center rounded"
                style={inputStyle}
                min={1}
                max={128000}
              />
            </div>

            {/* Auto-scroll */}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('settings.auto_scroll')}</span>
              <input
                type="checkbox"
                checked={settings.autoScroll}
                onChange={(e) => updateSettings({ autoScroll: e.target.checked })}
                style={{ accentColor: 'var(--accent-blue)' }}
              />
            </div>

            {/* System Prompt */}
            <div>
              <span className="text-sm block mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('settings.system_prompt')}
              </span>
              <textarea
                value={settings.systemPrompt}
                onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
                placeholder={t('settings.system_hint')}
                rows={3}
                className="w-full resize-none rounded-lg px-3 py-2 text-xs outline-none"
                style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-strong)',
                }}
              />
            </div>
          </div>
        </section>

        {/* ███ OpenClaw ███ */}
        <section>
          {sectionTitle('🐙', t('settings.openclaw'))}
          <div style={cardStyle} className="space-y-2">
            <label className="text-xs block" style={{ color: 'var(--text-dim)' }}>
              {t('settings.endpoint')}
            </label>
            <input value="http://localhost:1177" disabled style={{ ...inputStyle, color: 'var(--text-dim)' }} />
            <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{t('settings.endpoint_hint')}</p>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-[10px] pb-8 space-y-1" style={{ color: 'var(--text-dim)' }}>
          <p>{t('common.footer')}</p>
          <a
            href="https://github.com/2313819200/agentscope"
            className="hover:underline"
            style={{ color: 'var(--text-dim)' }}
          >
            {t('common.github')}
          </a>
        </div>
      </div>
    </div>
  );
}
