import { useStore } from '../store';

export function TokenBar() {
  const totalTokens = useStore((s) => s.totalTokens);
  const totalCost = useStore((s) => s.totalCost);

  const metrics = [
    { label: 'Input Tokens', value: totalTokens.input.toLocaleString() },
    { label: 'Output Tokens', value: totalTokens.output.toLocaleString() },
    { label: 'Total Tokens', value: totalTokens.total.toLocaleString(), highlight: true },
    { label: 'Cost', value: `$${totalCost.toFixed(4)}`, highlight: true },
  ];

  return (
    <div className="h-8 bg-surface-raised border-b border-gray-800/50 flex items-center px-4 gap-6 text-xs select-none">
      <span className="font-semibold text-accent-amber tracking-wider mr-2">
        AgentScope
      </span>
      {metrics.map((m) => (
        <span key={m.label} className="flex items-center gap-1">
          <span className="text-gray-500">{m.label}</span>
          <span className={m.highlight ? 'text-accent-green font-mono' : 'text-gray-300 font-mono'}>
            {m.value}
          </span>
        </span>
      ))}
    </div>
  );
}
