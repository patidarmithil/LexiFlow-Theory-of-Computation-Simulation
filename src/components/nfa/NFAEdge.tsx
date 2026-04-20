/**
 * NFAEdge.tsx — Custom React Flow edge for NFA/DFA transitions.
 * ε-transitions are rendered as dashed edges.
 * Self-loops (source === target) are rendered as a visible arc above the node.
 */
import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

// Render a proper looping arc for self-transitions
function getSelfLoopPath(
  x: number,
  y: number
): [string, number, number] {
  const r = 28; // arc radius
  const offset = 36; // how far above the node center the loop goes

  // SVG arc path that loops above the node
  const startX = x - r * 0.7;
  const startY = y;
  const endX   = x + r * 0.7;
  const endY   = y;
  const cpX    = x;
  const cpY    = y - offset * 2;

  const path = `M ${startX} ${startY} C ${startX} ${cpY}, ${endX} ${cpY}, ${endX} ${endY}`;
  const labelX = cpX;
  const labelY = y - offset * 2 - 12;
  return [path, labelX, labelY];
}

function NFAEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  data,
}: EdgeProps & { source?: string; target?: string }) {
  const isEpsilon = (data?.isEpsilon as boolean) ?? false;
  const label = (data?.label as string) ?? '';
  const isHovered = (data?.isHovered as boolean) ?? false;
  const isDFAMode = (data?.isDFAMode as boolean) ?? false;

  // Self-loop: read from data (explicitly passed) OR compare source/target props
  const dataSource = (data?.source as string) ?? source;
  const dataTarget = (data?.target as string) ?? target;
  const isSelfLoop = dataSource === dataTarget;


  const [edgePath, labelX, labelY] = isSelfLoop
    ? getSelfLoopPath(sourceX, sourceY)
    : getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });

  // Color logic: DFA uses amber, NFA uses indigo/slate
  const baseColor = isDFAMode ? '#f59e0b' : isEpsilon ? '#94a3b8' : '#6366f1';
  const hoverColor = '#8b5cf6';

  const strokeColor = isHovered ? hoverColor : baseColor;
  const strokeWidth = isHovered ? 3 : isEpsilon ? 1.5 : 2;

  const labelBg = isHovered
    ? 'bg-violet-100 text-violet-700 border-violet-300'
    : isDFAMode
    ? 'bg-amber-50/90 text-amber-700 border-amber-200/70'
    : isEpsilon
    ? 'bg-slate-100/90 text-slate-500 border-slate-200/70'
    : 'bg-indigo-50/90 text-indigo-600 border-indigo-200/70';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: isEpsilon ? '5 4' : undefined,
          opacity: isEpsilon && !isHovered ? 0.7 : 1,
          transition: 'stroke 0.2s, stroke-width 0.2s, opacity 0.2s',
          fill: 'none',
        }}
        markerEnd="url(#arrowhead)"
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'none',
          }}
          className="nodrag nopan"
        >
          <span
            className={`
              px-1.5 py-0.5 text-[11px] font-bold mono rounded-md
              border shadow-sm transition-all duration-200
              ${isHovered ? 'scale-110 shadow-md' : ''}
              ${labelBg}
            `}
          >
            {label}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(NFAEdge);
