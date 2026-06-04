import { useStore } from '../store';

const statusColors: Record<string, string> = {
  running: 'text-accent-green',
  idle: 'text-gray-400',
  error: 'text-accent-rose',
  completed: 'text-accent-blue',
};

export function MonitorPanel() {
  const sessions = useStore((s) => s.monitorSessions);
  const monitorConnected = useStore((s) => s.monitorConnected);
  const configs = useStore((s) => s.monitorConfigs);

  if (!monitorConnected) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 select-none">
        <div className="text-center space-y-3">
          <div className="text-4xl">📡</div>
          <p className="text-lg">Monitoring Disconnected</p>
          <p className="text-sm max-w-md">
            Connect to OpenClaw Gateway or other agent backends to see live sessions.
            Click "Connect Monitor" in the sidebar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 监视器头部 */}
      <div className="shrink-0 px-4 py-3 border-b border-gray-800/50 flex items-center gap-4">
        <h2 className="text-sm font-semibold text-gray-200">Agent Monitor</h2>
        <span className="flex items-center gap-1.5 text-xs text-accent-green">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          Connected ({sessions.length} sessions)
        </span>
        <div className="ml-auto flex gap-2">
          {configs.map((cfg) => (
            <span
              key={cfg.id}
              className="text-xs px-2 py-1 rounded bg-surface-overlay text-gray-400 border border-gray-800/50"
            >
              {cfg.icon} {cfg.name}
            </span>
          ))}
        </div>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p>No active agent sessions</p>
            <p className="text-xs mt-2">Waiting for events from connected monitors...</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="bg-surface-overlay border border-gray-800/50 rounded-xl p-4 space-y-2"
            >
              {/* 会话头部 */}
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-200">{session.agentName}</div>
                  <div className="text-xs text-gray-500">
                    {session.model} · {session.agentId}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium ${statusColors[session.status] ?? 'text-gray-400'}`}
                >
                  ● {session.status}
                </span>
              </div>

              {/* Token 使用量 */}
              {session.tokenUsage && (
                <div className="flex gap-4 text-xs text-gray-500 bg-surface-raised rounded-lg px-3 py-2">
                  <span>↗ {session.tokenUsage.input.toLocaleString()} in</span>
                  <span>↘ {session.tokenUsage.output.toLocaleString()} out</span>
                  <span className="text-gray-400">
                    ∑ {session.tokenUsage.total.toLocaleString()} total
                  </span>
                </div>
              )}

              {/* 工具调用日志 */}
              {session.tools.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 font-medium">Tool Calls</div>
                  {session.tools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center gap-2 text-xs bg-surface-raised rounded px-2 py-1"
                    >
                      <span className="text-accent-amber">🔧</span>
                      <span className="text-gray-300">{tool.name}</span>
                      <span
                        className={`ml-auto ${
                          tool.status === 'success'
                            ? 'text-accent-green'
                            : tool.status === 'error'
                              ? 'text-accent-rose'
                              : 'text-gray-500'
                        }`}
                      >
                        {tool.status}
                      </span>
                      {tool.duration && (
                        <span className="text-gray-600">{tool.duration}ms</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 时间 */}
              <div className="text-[10px] text-gray-600">
                Started {new Date(session.startedAt).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
