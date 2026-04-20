/**
 * NFAEdge.tsx — Custom React Flow edge for NFA/DFA transitions.
 * Supports dynamic curvature for bidirectional and parallel edges.
 */
import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

/**
 * Renders a quadratic bezier path with a specific curvature.
 * Used to separate bidirectional or parallel edges.
 */
function getQuadraticPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  curvature: number
): [string, number, number] {
  // Calculate mid point
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Calculate vector from source to target
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len === 0) return ['', sourceX, sourceY];

  // Normal vector (perpendicular to the edge)
  const nx = -dy / len;
  const ny = dx / len;

  // Control point offset by curvature
  const cpX = midX + nx * curvature;
  const cpY = midY + ny * curvature;

  const path = `M ${sourceX} ${sourceY} Q ${cpX} ${cpY} ${targetX} ${targetY}`;

  // Label position at t=0.5 on the quadratic curve
  // B(t) = (1-t)^2*P0 + 2(1-t)t*P1 + t^2*P2
  const labelX = 0.25 * sourceX + 0.5 * cpX + 0.25 * targetX;
  const labelY = 0.25 * sourceY + 0.5 * cpY + 0.25 * targetY;

  return [path, labelX, labelY];
}

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
  const curvature = (data?.curvature as number) ?? 0;

  // Self-loop detection
  const dataSource = (data?.source as string) ?? source;
  const dataTarget = (data?.target as string) ?? target;
  const isSelfLoop = dataSource === dataTarget;

  // Path selection: Self-loop vs Quadratic (Curved) vs Bezier (Straight/Default)
  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (isSelfLoop) {
    [edgePath, labelX, labelY] = getSelfLoopPath(sourceX, sourceY);
  } else if (curvature !== 0) {
    [edgePath, labelX, labelY] = getQuadraticPath(sourceX, sourceY, targetX, targetY, curvature);
  } else {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  }

  // Color logic
  const baseColor = isDFAMode ? '#f59e0b' : isEpsilon ? '#94a3b8' : '#6366f1';
  const hoverColor = '#8b5cf6';

  const strokeColor = isHovered ? hoverColor : baseColor;
  const strokeWidth = isHovered ? 3 : isEpsilon ? 1.5 : 2;

  // Solid background styling for labels to prevent overlap issues
  const labelBg = isHovered
    ? 'bg-white text-violet-700 border-violet-300'
    : isDFAMode
    ? 'bg-white text-amber-700 border-amber-200'
    : isEpsilon
    ? 'bg-white text-slate-500 border-slate-200'
    : 'bg-white text-indigo-600 border-indigo-200';

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
              ${isHovered ? 'scale-110 shadow-md ring-2 ring-violet-500/20' : ''}
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
