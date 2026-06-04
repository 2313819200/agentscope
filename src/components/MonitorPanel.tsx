import { useStore } from '../store';
import { useI18n } from '../i18n/index';

const statusColors: Record<string, string> = {
  running: 'var(--accent-green)',
  idle: 'var(--text-muted)',
  error: 'var(--accent-rose)',
  completed: 'var(--accent-blue)',
};

export function MonitorPanel() {
  const sessions = useStore((s) => s.monitorSessions);
  const monitorConnected = useStore((s) => s.monitorConnected);
  const configs = useStore((s) => s.monitorConfigs);
  const { t } = useI18n();

  if (!monitorConnected) {
    return (
      <div className="flex-1 flex items-center justify-center select-none" style={{ color: 'var(--text-muted)' }}>
        <div className="text-center space-y-2">
          <div className="text-4xl">📡</div>
          <p className="text-base">{t('monitor.disconnected')}</p>
          <p className="text-xs max-w-md" style={{ color: 'var(--text-dim)' }}>{t('monitor.connect_hint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 头部 */}
      <div
        className="shrink-0 px-4 py-2.5 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {t('monitor.title')}
        </span>
        <span
          className="flex items-center gap-1.5 text-xs"
          style={{ color: 'var(--accent-green)' }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: 'var(--accent-green)' }}
          />
          {t('monitor.connected')} ({sessions.length} {t('monitor.sessions')})
        </span>
        <div className="ml-auto flex gap-2">
          {configs.map((cfg) => (
            <span
              key={cfg.id}
              className="text-xs px-2 py-1 rounded"
              style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              {cfg.icon} {cfg.name}
            </span>
          ))}
        </div>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center" style={{ color: 'var(--text-muted)', marginTop: '5rem' }}>
            <p>{t('monitor.no_sessions')}</p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-dim)' }}>{t('monitor.waiting')}</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-xl p-4 space-y-2"
              style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}
            >
              {/* 会话头 */}
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {session.agentName}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                    {session.model} · {session.agentId}
                  </div>
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: statusColors[session.status] ?? 'var(--text-muted)' }}
                >
                  ● {session.status}
                </span>
              </div>

              {/* Token 用量 */}
              {session.tokenUsage && (
                <div
                  className="flex gap-4 text-xs rounded-lg px-3 py-1.5"
                  style={{ background: 'var(--bg-raised)', color: 'var(--text-dim)' }}
                >
                  <span>↗ {session.tokenUsage.input.toLocaleString()} {t('monitor.in')}</span>
                  <span>↘ {session.tokenUsage.output.toLocaleString()} {t('monitor.out')}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    ∑ {session.tokenUsage.total.toLocaleString()} {t('monitor.total')}
                  </span>
                </div>
              )}

              {/* 工具调用 */}
              {session.tools.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium" style={{ color: 'var(--text-dim)' }}>
                    {t('monitor.tool_calls')}
                  </div>
                  {session.tools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center gap-2 text-xs rounded px-2 py-1"
                      style={{ background: 'var(--bg-raised)' }}
                    >
                      <span style={{ color: 'var(--accent-amber)' }}>🔧</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{tool.name}</span>
                      <span
                        className="ml-auto"
                        style={{
                          color:
                            tool.status === 'success'
                              ? 'var(--accent-green)'
                              : tool.status === 'error'
                                ? 'var(--accent-rose)'
                                : 'var(--text-muted)',
                        }}
                      >
                        {tool.status}
                      </span>
                      {tool.duration && (
                        <span style={{ color: 'var(--text-dim)' }}>{tool.duration}ms</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 时间 */}
              <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                {t('monitor.started')} {new Date(session.startedAt).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
