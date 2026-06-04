import { useStore } from '../store';
import { useI18n } from '../i18n/index';
import { useTheme } from '../theme';

export function TokenBar() {
  const totalTokens = useStore((s) => s.totalTokens);
  const totalCost = useStore((s) => s.totalCost);
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const metrics = [
    { label: t('token.input'), value: totalTokens.input.toLocaleString() },
    { label: t('token.output'), value: totalTokens.output.toLocaleString() },
    { label: t('token.total'), value: totalTokens.total.toLocaleString(), highlight: true },
    { label: t('token.cost'), value: `$${totalCost.toFixed(4)}`, highlight: true },
  ];

  return (
    <div
      className="h-9 flex items-center px-4 gap-4 text-xs select-none shrink-0"
      style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}
    >
      <span className="font-semibold tracking-wider mr-1" style={{ color: 'var(--accent-amber)' }}>
        AgentScope
      </span>

      {metrics.map((m) => (
        <span key={m.label} className="flex items-center gap-1">
          <span style={{ color: 'var(--text-muted)' }}>{m.label}</span>
          <span
            className="font-mono"
            style={{ color: m.highlight ? 'var(--accent-green)' : 'var(--text-secondary)' }}
          >
            {m.value}
          </span>
        </span>
      ))}

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="text-xs px-2 py-1 rounded transition-all"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}
