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

// ──── 自定义节点 ────

function BaseNode({ data, selected }: NodeProps) {
  const d = data as Record<string, unknown>;
  const nodeType = (d.nodeType as string) ?? 'model';
  const label = (d.label as string) ?? '';
  const icon = (d.icon as string) ?? '🤖';
  const subtitle = d.subtitle as string | undefined;
  const tokens = d.tokens as number | undefined;

  const colors: Record<string, string> = {
    model: 'border-accent-blue bg-accent-blue/5',
    agent: 'border-accent-purple bg-accent-purple/5',
    tool: 'border-accent-amber bg-accent-amber/5',
    user: 'border-accent-green bg-accent-green/5',
    system: 'border-accent-rose bg-accent-rose/5',
  };

  const borderColor = colors[nodeType] ?? colors.model;

  return (
    <div
      className={`px-3 py-2 rounded-xl border-2 text-xs min-w-[120px] ${borderColor} ${
        selected ? 'ring-2 ring-accent-blue/50' : ''
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-500" />
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <div>
          <div className="font-medium text-gray-200">{label}</div>
          {subtitle && (
            <div className="text-gray-500 text-[10px] mt-0.5">{subtitle}</div>
          )}
        </div>
      </div>
      {tokens !== undefined && (
        <div className="mt-1 text-[10px] text-gray-500">∑ {tokens.toLocaleString()} tokens</div>
      )}
      <Handle type="source" position={Position.Right} className="!bg-gray-500" />
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

// ──── 主组件 ────

export function AgentGraph() {
  const sessions = useStore((s) => s.monitorSessions);
  const totalTokens = useStore((s) => s.totalTokens);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [
      makeNode('root', 250, 50, {
        nodeType: 'system',
        label: 'AgentScope Hub',
        icon: '🪐',
        subtitle: `${sessions.length} active sessions`,
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
        animated: session.status === 'running',
        color: '#6366f1',
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
          animated: true,
          color: '#f59e0b',
        }));
      });
    });

    if (totalTokens.total > 0 && sessions.length > 0) {
      const lastId = sessions[sessions.length - 1].id;
      nodes.push(
        makeNode('tokens', 250, 150 + sessions.length * 120 + 50, {
          nodeType: 'model',
          label: 'Token Usage',
          icon: '📊',
          subtitle: `${totalTokens.total.toLocaleString()} total`,
        })
      );
      edges.push(makeEdge('root-tokens', lastId, 'tokens', { color: '#10b981', dashed: true }));
    }

    return { nodes, edges };
  }, [sessions, totalTokens]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync when sessions change (since useNodesState captures initial only)
  // We use a key to force remount
  const graphKey = useMemo(() => sessions.map((s) => s.id).join(','), [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 select-none">
        <div className="text-center space-y-3">
          <div className="text-4xl">🕸️</div>
          <p className="text-lg">No Graph Data</p>
          <p className="text-sm max-w-md">
            Connect to an agent monitor and run some sessions to see the graph.
            Each agent session and tool call will appear here.
          </p>
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
        className="bg-surface"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1a1a2e" gap={20} />
        <Controls className="!bg-surface-raised !border-gray-800 !text-gray-400" />
        <MiniMap
          className="!bg-surface-raised !border-gray-800"
          nodeColor="#3b82f6"
          maskColor="rgba(10,10,15,0.8)"
        />
      </ReactFlow>
    </div>
  );
}
