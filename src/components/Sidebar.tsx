import { useStore } from '../store';
import { AVAILABLE_MODELS } from '../providers/index';
import { useI18n } from '../i18n/index';
import type { ModelId } from '../types';

const tabs = [
  { id: 'chat' as const, icon: '💬' },
  { id: 'monitor' as const, icon: '📡' },
  { id: 'graph' as const, icon: '🕸️' },
  { id: 'settings' as const, icon: '⚙️' },
];

export function Sidebar() {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const selectedModel = useStore((s) => s.selectedModel);
  const setSelectedModel = useStore((s) => s.setSelectedModel);
  const selectedModelName = useStore((s) => s.selectedModelName);
  const startChat = useStore((s) => s.startChat);
  const clearChat = useStore((s) => s.clearChat);
  const apiKeys = useStore((s) => s.apiKeys);
  const monitorConnected = useStore((s) => s.monitorConnected);
  const connectMonitor = useStore((s) => s.connectMonitor);
  const disconnectMonitor = useStore((s) => s.disconnectMonitor);
  const { t, lang, setLang } = useI18n();

  const btn = (children: React.ReactNode, active = false, onClick?: () => void, extra = '') => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-all"
      style={{
        color: active ? 'var(--accent-blue)' : 'var(--text-muted)',
        background: active ? 'color-mix(in srgb, var(--accent-blue) 8%, transparent)' : 'transparent',
        border: active ? `1px solid color-mix(in srgb, var(--accent-blue) 20%, transparent)` : '1px solid transparent',
      }}
      onMouseEnter={(e) => { if (!active && !extra) e.currentTarget.style.background = 'color-mix(in srgb, var(--bg-overlay) 50%, transparent)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      onMouseLeave={(e) => { if (!active && !extra) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      {children}
    </button>
  );

  return (
    <aside
      className="w-56 flex flex-col shrink-0 overflow-y-auto custom-scroll"
      style={{ background: 'var(--bg-raised)', borderRight: '1px solid var(--border)' }}
    >
      {/* 模型选择 */}
      <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="text-xs font-medium mb-2 px-1 uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
          {t('nav.models')}
        </div>
        <div className="space-y-1">
          {AVAILABLE_MODELS.map((model) => (
            <div key={model.id}>
              <button
                onClick={() => {
                  setSelectedModel(model.id, model.models[0]);
                  if (selectedModel !== model.id) startChat(model.id, model.models[0]);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  color: selectedModel === model.id ? 'var(--accent-blue)' : 'var(--text-muted)',
                  background: selectedModel === model.id ? 'color-mix(in srgb, var(--accent-blue) 8%, transparent)' : 'transparent',
                  border: selectedModel === model.id ? '1px solid color-mix(in srgb, var(--accent-blue) 20%, transparent)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => { if (selectedModel !== model.id) { e.currentTarget.style.background = 'color-mix(in srgb, var(--bg-overlay) 50%, transparent)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
                onMouseLeave={(e) => { if (selectedModel !== model.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
              >
                <span>{model.icon}</span>
                <span className="flex-1 text-left">{model.name}</span>
                {apiKeys[model.id] && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-green)' }} />
                )}
              </button>
              {selectedModel === model.id && (
                <div className="ml-6 mt-0.5 space-y-0.5">
                  {model.models.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedModel(model.id, m)}
                      className="block w-full text-left px-2 py-0.5 rounded text-xs transition-all"
                      style={{
                        color: selectedModelName === m ? 'var(--accent-green)' : 'var(--text-dim)',
                        background: selectedModelName === m ? 'color-mix(in srgb, var(--accent-green) 5%, transparent)' : 'transparent',
                      }}
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

      {/* 导航 */}
      <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="text-xs font-medium mb-2 px-1 uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
          {t('nav.navigation')}
        </div>
        <div className="space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-all"
              style={{
                color: activeTab === tab.id ? 'var(--accent-purple)' : 'var(--text-muted)',
                background: activeTab === tab.id ? 'color-mix(in srgb, var(--accent-purple) 8%, transparent)' : 'transparent',
                border: activeTab === tab.id ? '1px solid color-mix(in srgb, var(--accent-purple) 20%, transparent)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => { if (activeTab !== tab.id) { e.currentTarget.style.background = 'color-mix(in srgb, var(--bg-overlay) 50%, transparent)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
              onMouseLeave={(e) => { if (activeTab !== tab.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
            >
              <span>{tab.icon}</span>
              <span>{t(`nav.${tab.id}`)}</span>
              {tab.id === 'monitor' && monitorConnected && (
                <span className="ml-auto flex items-center gap-1 text-xs" style={{ color: 'var(--accent-green)' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-green)' }} />
                  {t('sidebar.live')}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 操作 */}
      <div className="p-3 flex-1">
        <div className="text-xs font-medium mb-2 px-1 uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
          {t('nav.actions')}
        </div>
        <div className="space-y-0.5">
          <button
            onClick={() => connectMonitor()}
            disabled={monitorConnected}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-all disabled:opacity-30"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { if (!monitorConnected) { e.currentTarget.style.background = 'color-mix(in srgb, var(--bg-overlay) 50%, transparent)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
            onMouseLeave={(e) => { if (!monitorConnected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
          >
            <span>🔌</span>
            <span>{monitorConnected ? t('sidebar.connected') : t('sidebar.connect')}</span>
          </button>
          <button
            onClick={() => disconnectMonitor()}
            disabled={!monitorConnected}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-all disabled:opacity-30"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { if (monitorConnected) { e.currentTarget.style.background = 'color-mix(in srgb, var(--bg-overlay) 50%, transparent)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
            onMouseLeave={(e) => { if (monitorConnected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
          >
            <span>⏹️</span>
            <span>{t('sidebar.disconnect')}</span>
          </button>
          <button
            onClick={() => clearChat()}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--bg-overlay) 50%, transparent)'; e.currentTarget.style.color = 'var(--accent-rose)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <span>🗑️</span>
            <span>{t('chat.clear')}</span>
          </button>
        </div>

        {/* 语言切换 */}
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1 px-2">
            <button
              onClick={() => setLang('zh')}
              className="text-xs px-2 py-1 rounded transition-all"
              style={{
                color: lang === 'zh' ? 'var(--accent-blue)' : 'var(--text-dim)',
                background: lang === 'zh' ? 'color-mix(in srgb, var(--accent-blue) 10%, transparent)' : 'transparent',
                fontWeight: lang === 'zh' ? 600 : 400,
              }}
            >
              中文
            </button>
            <span style={{ color: 'var(--text-dim)' }}>|</span>
            <button
              onClick={() => setLang('en')}
              className="text-xs px-2 py-1 rounded transition-all"
              style={{
                color: lang === 'en' ? 'var(--accent-blue)' : 'var(--text-dim)',
                background: lang === 'en' ? 'color-mix(in srgb, var(--accent-blue) 10%, transparent)' : 'transparent',
                fontWeight: lang === 'en' ? 600 : 400,
              }}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
