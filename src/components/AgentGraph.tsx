import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store';
import { useI18n } from '../i18n/index';

function BaseNode({ data, selected }: NodeProps) {
  const d = data as Record<string, unknown>;
  const nodeType = (d.nodeType as string) ?? 'model';
  const label = (d.label as string) ?? '';
  const icon = (d.icon as string) ?? '🤖';
  const subtitle = d.subtitle as string | undefined;
  const tokens = d.tokens as number | undefined;

  const colors: Record<string, string> = {
    model: 'var(--accent-blue)',
    agent: 'var(--accent-purple)',
    tool: 'var(--accent-amber)',
    user: 'var(--accent-green)',
    system: 'var(--accent-rose)',
  };

  const borderColor = colors[nodeType] ?? colors.model;

  return (
    <div
      className="px-3 py-2 rounded-xl border-2 text-xs min-w-[120px]"
      style={{
        borderColor,
        background: `color-mix(in srgb, ${borderColor} 8%, var(--bg-overlay))`,
        outline: selected ? `2px solid color-mix(in srgb, ${borderColor} 50%, transparent)` : 'none',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: 'var(--text-muted)' }} />
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <div>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
          {subtitle && <div style={{ color: 'var(--text-dim)', fontSize: '10px', marginTop: '1px' }}>{subtitle}</div>}
        </div>
      </div>
      {tokens !== undefined && (
        <div style={{ color: 'var(--text-dim)', fontSize: '10px', marginTop: '4px' }}>
          ∑ {tokens.toLocaleString()} tokens
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: 'var(--text-muted)' }} />
    </div>
  );
}

const nodeTypes = { base: BaseNode };

function makeNode(id: string, x: number, y: number, data: Record<string, unknown>): Node {
  return { id, type: 'base', position: { x, y }, data };
}

function makeEdge(
  id: string,
  source: string,
  target: string,
  opts: { animated?: boolean; color?: string; dashed?: boolean } = {}
): Edge {
  return {
    id,
    source,
    target,
    animated: opts.animated ?? false,
    style: {
      stroke: opts.color ?? '#6366f1',
      strokeWidth: 1.5,
      ...(opts.dashed ? { strokeDasharray: '5 5' } : {}),
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: opts.color ?? '#6366f1' },
  };
}

export function AgentGraph() {
  const sessions = useStore((s) => s.monitorSessions);
  const totalTokens = useStore((s) => s.totalTokens);
  const { t } = useI18n();

  const graphKey = useMemo(() => sessions.map((s) => s.id).join(','), [sessions]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [
      makeNode('root', 250, 50, {
        nodeType: 'system',
        label: t('graph.hub'),
        icon: '🪐',
        subtitle: `${sessions.length} ${t('monitor.sessions')}`,
      }),
    ];
    const edges: Edge[] = [];

    sessions.forEach((session, i) => {
      const yOffset = 150 + i * 120;
      nodes.push(
        makeNode(session.id, 250, yOffset, {
          nodeType: 'agent',
          label: session.agentName ?? 'Agent',
          icon: '🤖',
          subtitle: session.model,
          tokens: session.tokenUsage?.total,
        })
      );
      edges.push(makeEdge(`root-${session.id}`, 'root', session.id, {
        animated: session.status === 'running', color: '#6366f1',
      }));

      session.tools.forEach((tool, j) => {
        const toolId = `${session.id}-tool-${j}`;
        nodes.push(
          makeNode(toolId, 500, yOffset + j * 80, {
            nodeType: 'tool',
            label: tool.name,
            icon: '🔧',
            subtitle: tool.status,
          })
        );
        edges.push(makeEdge(`${session.id}-${toolId}`, session.id, toolId, {
          animated: true, color: '#f59e0b',
        }));
      });
    });

    if (totalTokens.total > 0 && sessions.length > 0) {
      const lastId = sessions[sessions.length - 1].id;
      nodes.push(
        makeNode('tokens', 250, 150 + sessions.length * 120 + 50, {
          nodeType: 'model',
          label: t('graph.token_usage'),
          icon: '📊',
          subtitle: `${totalTokens.total.toLocaleString()} ${t('chat.tokens')}`,
        })
      );
      edges.push(makeEdge('root-tokens', lastId, 'tokens', { color: '#10b981', dashed: true }));
    }

    return { nodes, edges };
  }, [sessions, totalTokens, t]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center select-none" style={{ color: 'var(--text-muted)' }}>
        <div className="text-center space-y-2">
          <div className="text-4xl">🕸️</div>
          <p className="text-base">{t('graph.no_data')}</p>
          <p className="text-xs max-w-md" style={{ color: 'var(--text-dim)' }}>{t('graph.hint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1" key={graphKey}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1a1a2e" gap={20} />
        <Controls className="!bg-surface-raised !border-border !text-muted" />
        <MiniMap
          className="!bg-surface-raised !border-border"
          nodeColor="#3b82f6"
          maskColor="rgba(10,10,15,0.8)"
        />
      </ReactFlow>
    </div>
  );
}
