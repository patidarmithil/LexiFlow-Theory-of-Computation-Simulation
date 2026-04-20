/**
 * NFAEdge.tsx — Custom React Flow edge for NFA transitions.
 * ε-transitions are rendered as dashed edges.
 *
 * Uses `Record<string, unknown>` as the data constraint to match
 * React Flow's EdgeProps generic correctly.
 */
import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';

function NFAEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const isEpsilon = (data?.isEpsilon as boolean) ?? false;
  const label = (data?.label as string) ?? '';
  const isHovered = (data?.isHovered as boolean) ?? false;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: isHovered ? '#8b5cf6' : isEpsilon ? '#94a3b8' : '#6366f1',
          strokeWidth: isHovered ? 3 : isEpsilon ? 1.5 : 2,
          strokeDasharray: isEpsilon ? '5 4' : undefined,
          opacity: isEpsilon && !isHovered ? 0.7 : 1,
          transition: 'stroke 0.2s, stroke-width 0.2s, opacity 0.2s',
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
              px-1.5 py-0.5 text-[10px] font-bold mono rounded-md
              border shadow-sm transition-all duration-200
              ${
                isHovered
                  ? 'bg-violet-100 text-violet-700 border-violet-300 scale-110 shadow-md'
                  : isEpsilon
                  ? 'bg-slate-100/90 text-slate-500 border-slate-200/70'
                  : 'bg-indigo-50/90 text-indigo-600 border-indigo-200/70'
              }
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
