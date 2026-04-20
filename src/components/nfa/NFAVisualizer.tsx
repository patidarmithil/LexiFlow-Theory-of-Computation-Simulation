/**
 * NFAVisualizer.tsx
 * React Flow canvas with Dagre-computed left-to-right layout.
 */
import { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

import NFANode from './NFANode';
import NFAEdge from './NFAEdge';
import type { NFA } from '../../lib/types';

const nodeTypes = { nfaState: NFANode };
const edgeTypes = { nfaTransition: NFAEdge };

// ── Dagre layout ─────────────────────────────────────────────────────────────

const NODE_WIDTH = 56;
const NODE_HEIGHT = 56;

function computeLayout(nfa: NFA): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph({ multigraph: true });
  g.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 70, edgesep: 20 });
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to dagre
  for (const state of nfa.states) {
    g.setNode(state.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // Add edges to dagre (use unique edge keys for multigraph)
  nfa.transitions.forEach((t, i) => {
    g.setEdge(t.from, t.to, {}, `e${i}`);
  });

  dagre.layout(g);

  // Build React Flow nodes
  const rfNodes: Node[] = nfa.states.map((state) => {
    const pos = g.node(state.id);
    return {
      id: state.id,
      type: 'nfaState',
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
      data: {
        label: state.id,
        isStart: state.isStart,
        isAccept: state.isAccept,
      },
    };
  });

  // Build React Flow edges
  // Group parallel transitions (same from→to) for label merging
  const edgeMap = new Map<string, string[]>();
  for (const t of nfa.transitions) {
    const key = `${t.from}→${t.to}`;
    const sym = t.symbol === null ? 'ε' : t.symbol;
    if (!edgeMap.has(key)) edgeMap.set(key, []);
    edgeMap.get(key)!.push(sym);
  }

  let edgeIdx = 0;
  const rfEdges: Edge[] = [];
  for (const [key, symbols] of edgeMap.entries()) {
    const [from, to] = key.split('→');
    const label = symbols.join(', ');
    const isEpsilon = symbols.every((s) => s === 'ε');
    rfEdges.push({
      id: `edge-${edgeIdx++}`,
      source: from,
      target: to,
      type: 'nfaTransition',
      data: { label, isEpsilon },
      // Self-loops need a curved offset
      ...(from === to ? { sourceHandle: 'top', targetHandle: 'top' } : {}),
    });
  }

  return { nodes: rfNodes, edges: rfEdges };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface NFAVisualizerProps {
  nfa: NFA;
}

import { useAppStore } from '../../store/appStore';

export default function NFAVisualizer({ nfa }: NFAVisualizerProps) {
  const { hoveredRule, currentStep, derivationSteps, derivationFound } = useAppStore();

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => computeLayout(nfa),
    [nfa]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  // Compute active state based on derivation
  const activeState = useMemo(() => {
    if (currentStep >= 0 && currentStep < derivationSteps.length) {
      const step = derivationSteps[currentStep];
      const match = step.sententialForm.match(/Q\d+/);
      if (match) {
        return 'q' + match[0].substring(1);
      }
      if (derivationFound && currentStep === derivationSteps.length - 1) {
         // Final accept state could be marked active if desired, but we'll leave it as null
         // because there's no non-terminal left.
      }
    }
    return null;
  }, [currentStep, derivationSteps, derivationFound]);

  // Sync Nodes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        let isActive = n.id === activeState;
        let isHovered = false;

        if (hoveredRule) {
          const [lhsNT, rhsStr] = hoveredRule.split('->');
          const sourceState = 'q' + lhsNT.substring(1);
          
          if (n.id === sourceState) isHovered = true;

          if (rhsStr !== 'ε') {
             const parts = rhsStr.split(' ');
             const targetNT = parts.length === 2 ? parts[1] : parts[0];
             const targetState = 'q' + targetNT.substring(1);
             if (n.id === targetState) isHovered = true;
          }
        }

        if (n.data.isActive !== isActive || n.data.isHovered !== isHovered) {
          return { ...n, data: { ...n.data, isActive, isHovered } };
        }
        return n;
      })
    );
  }, [activeState, hoveredRule, setNodes]);

  // Sync Edges
  useEffect(() => {
    setEdges((eds) =>
      eds.map((e) => {
        let isHovered = false;

        if (hoveredRule) {
           const [lhsNT, rhsStr] = hoveredRule.split('->');
           const sourceState = 'q' + lhsNT.substring(1);
           
           if (e.source === sourceState && rhsStr !== 'ε') {
              const parts = rhsStr.split(' ');
              let symbol = '';
              let targetNT = '';
              
              if (parts.length === 2) {
                 symbol = parts[0];
                 targetNT = parts[1];
              } else if (parts.length === 1) {
                 symbol = 'ε';
                 targetNT = parts[0];
              }
              
              const targetState = 'q' + targetNT.substring(1);
              
              if (e.target === targetState) {
                 const labels = (e.data?.label as string).split(', ');
                 if (labels.includes(symbol)) {
                    isHovered = true;
                 }
              }
           }
        }

        if (e.data?.isHovered !== isHovered) {
          return { ...e, data: { ...e.data, isHovered } };
        }
        return e;
      })
    );
  }, [hoveredRule, setEdges]);

  return (
    <div className="w-full h-full relative group">
      {/* Legend & Stats Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-3 pointer-events-none">
        <div className="flex gap-2">
          <StatChip label="States" value={nfa.states.length} />
          <StatChip label="Transitions" value={nfa.transitions.length} />
        </div>
        <div className="flex flex-col gap-2 p-3 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm">
          <LegendItem variant="indigo" label="Start State" />
          <LegendItem variant="emerald" label="Accept State" />
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">
             <span className="w-5 border-t-2 border-dashed border-slate-300" />
             <span>ε-transition</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-full bg-slate-50/50 relative">
        {/* Custom arrowhead marker */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#4f46e5" />
            </marker>
          </defs>
        </svg>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
          minZoom={0.5}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          className="w-full h-full"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
          <Controls
            className="!bg-white !border-slate-200 !shadow-md !rounded-xl overflow-hidden"
            showInteractive={false}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

function LegendItem({ variant, label }: { variant: 'indigo' | 'emerald'; label: string }) {
  const styles = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border flex items-center gap-2 ${styles[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${variant === 'indigo' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
      {label}
    </span>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="px-3 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-slate-500 shadow-sm">
      {label.toUpperCase()}: <span className="text-slate-900">{value}</span>
    </span>
  );
}
