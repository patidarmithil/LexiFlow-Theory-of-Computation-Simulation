/**
 * NFAVisualizer.tsx
 * React Flow canvas with Dagre-computed left-to-right layout.
 * Supports toggling between ε-NFA and DFA views.
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
import { useAppStore } from '../../store/appStore';

const nodeTypes = { nfaState: NFANode };
const edgeTypes = { nfaTransition: NFAEdge };

// ── Dagre layout ─────────────────────────────────────────────────────────────

const NODE_WIDTH = 64;
const NODE_HEIGHT = 64;

function computeLayout(nfa: NFA, isDFA = false): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph({ multigraph: true });
  // Aggressively increase separation for maximum vertical spread and "airy" look
  g.setGraph({ 
    rankdir: 'LR', 
    nodesep: 250,    // Drastically increased vertical space
    ranksep: 100,    // Short horizontal space
    edgesep: 80      // Space between edges
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const state of nfa.states) {
    g.setNode(state.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  nfa.transitions.forEach((t, i) => {
    g.setEdge(t.from, t.to, {}, `e${i}`);
  });

  dagre.layout(g);

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
        isDFAMode: isDFA,
      },
    };
  });

  // Group parallel transitions for label merging
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
    const reverseKey = `${to}→${from}`;
    const isSelfLoop = from === to;
    
    // Detect bidirectional: if there's a transition in the opposite direction
    const isBidirectional = !isSelfLoop && edgeMap.has(reverseKey);
    
    const label = symbols.join(', ');
    const isEpsilon = symbols.every((s) => s === 'ε');

    // Aggressive dynamic curvature with jitter to ensure arrows are distinct
    let curvature = 0;
    if (!isSelfLoop) {
      // Deterministic jitter based on edge index to spread parallel/overlapping lines
      const jitter = (edgeIdx % 3) * 15;

      if (isBidirectional) {
        curvature = 60 + jitter; 
      } else {
        const fromPos = g.node(from);
        const toPos = g.node(to);
        const dx = Math.abs(toPos.x - fromPos.x);
        
        if (dx > 250) {
          curvature = 60 + jitter + (dx / 300) * 20;
        } else if (dx > 80) {
          curvature = 45 + jitter;
        } else {
          curvature = 25 + jitter;
        }
      }
    }
    
    rfEdges.push({
      id: `edge-${edgeIdx++}`,
      source: from,
      target: to,
      type: 'nfaTransition',
      data: { 
        label, 
        isEpsilon, 
        isDFAMode: isDFA, 
        source: from, 
        target: to,
        curvature
      },
      ...(isSelfLoop
        ? { sourceHandle: 'top-source', targetHandle: 'top' }
        : {}),
    });
  }

  return { nodes: rfNodes, edges: rfEdges };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface NFAVisualizerProps {
  nfa: NFA;
}

export default function NFAVisualizer({ nfa }: NFAVisualizerProps) {
  const {
    hoveredRule,
    currentStep,
    derivationSteps,
    derivationFound,
  } = useAppStore();

  const activeAutomaton = nfa;
  const isDFA = false;

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => computeLayout(activeAutomaton, isDFA),
    [activeAutomaton, isDFA]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  // Re-sync layout when switching NFA ↔ DFA
  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  // Active state highlight (NFA derivation trace only)
  const activeState = useMemo(() => {
    if (isDFA) return null;
    if (currentStep >= 0 && currentStep < derivationSteps.length) {
      const step = derivationSteps[currentStep];
      const match = step.sententialForm.match(/Q\d+/);
      if (match) return 'q' + match[0].substring(1);
    }
    return null;
  }, [currentStep, derivationSteps, derivationFound, isDFA]);

  // Sync node highlight
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const isActive = n.id === activeState;
        let isHovered = false;

        if (!isDFA && hoveredRule) {
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
  }, [activeState, hoveredRule, setNodes, isDFA]);

  // Sync edge highlight
  useEffect(() => {
    setEdges((eds) =>
      eds.map((e) => {
        let isHovered = false;
        if (!isDFA && hoveredRule) {
          const [lhsNT, rhsStr] = hoveredRule.split('->');
          const sourceState = 'q' + lhsNT.substring(1);
          if (e.source === sourceState && rhsStr !== 'ε') {
            const parts = rhsStr.split(' ');
            let symbol = '';
            let targetNT = '';
            if (parts.length === 2) { symbol = parts[0]; targetNT = parts[1]; }
            else if (parts.length === 1) { symbol = 'ε'; targetNT = parts[0]; }
            const targetState = 'q' + targetNT.substring(1);
            if (e.target === targetState) {
              const labels = (e.data?.label as string).split(', ');
              if (labels.includes(symbol)) isHovered = true;
            }
          }
        }
        if (e.data?.isHovered !== isHovered) {
          return { ...e, data: { ...e.data, isHovered } };
        }
        return e;
      })
    );
  }, [hoveredRule, setEdges, isDFA]);

  return (
    <div className="w-full h-full relative group">
      {/* Legend & Stats Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-3 pointer-events-none">
        <div className="flex gap-2">
          <StatChip label="States" value={activeAutomaton.states.length} />
          <StatChip label="Transitions" value={activeAutomaton.transitions.length} />
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
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="12"
              markerHeight="9"
              refX="12"
              refY="4.5"
              orient="auto"
            >
              <polygon points="0 0, 12 4.5, 0 9" fill="#4f46e5" />
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
          fitViewOptions={{ padding: 0.4, minZoom: 0.5, maxZoom: 1.5 }}
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

// ── Sub-components ────────────────────────────────────────────────────────────

function LegendItem({ variant, label }: { variant: 'indigo' | 'emerald' | 'amber'; label: string }) {
  const styles = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
  };
  const dotStyles = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
  };

  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border flex items-center gap-2 ${styles[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />
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
