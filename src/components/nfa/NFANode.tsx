/**
 * NFANode.tsx — Custom React Flow node for NFA/DFA states.
 *
 * Variants:
 *   - Start state:  blue/amber ring (NFA/DFA)
 *   - Accept state: double ring (emerald)
 *   - Start+Accept: both
 *   - Normal:       slate
 */
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';

interface NFANodeData {
  label: string;
  isStart: boolean;
  isAccept: boolean;
  isActive?: boolean;
  isHovered?: boolean;
  isDFAMode?: boolean;
}

function NFANode({ data }: { data: NFANodeData }) {
  const { label, isStart, isAccept, isActive, isHovered, isDFAMode } = data;

  let outerRing = 'border-slate-300 bg-white/70';
  let innerColor = 'bg-slate-100/80';
  let textColor = 'text-slate-700';

  if (isStart && isAccept) {
    if (isDFAMode) {
      outerRing = 'border-amber-400 bg-amber-50/70';
      innerColor = 'bg-amber-100/60';
      textColor = 'text-amber-800';
    } else {
      outerRing = 'border-violet-400 bg-violet-50/70';
      innerColor = 'bg-violet-100/60';
      textColor = 'text-violet-800';
    }
  } else if (isStart) {
    if (isDFAMode) {
      outerRing = 'border-amber-400 bg-amber-50/70';
      innerColor = 'bg-amber-100/60';
      textColor = 'text-amber-800';
    } else {
      outerRing = 'border-blue-400 bg-blue-50/70';
      innerColor = 'bg-blue-100/60';
      textColor = 'text-blue-800';
    }
  } else if (isAccept) {
    outerRing = 'border-emerald-400 bg-emerald-50/70';
    innerColor = 'bg-emerald-100/60';
    textColor = 'text-emerald-800';
  }

  let ringStyle = {};
  if (isActive) {
    ringStyle = { boxShadow: '0 0 0 4px rgba(59,130,246,0.3), 0 0 20px rgba(59,130,246,0.5)', borderColor: '#3b82f6' };
  } else if (isHovered) {
    ringStyle = { boxShadow: '0 0 0 3px rgba(139,92,246,0.2)', borderColor: '#8b5cf6' };
  }

  return (
    <>
      {/* Left handle — for incoming regular transitions */}
      <Handle type="target" position={Position.Left} id="left" style={{ left: '-2px', opacity: 0, background: 'transparent', border: 'none' }} />
      {/* Top handle — for self-loop transitions */}
      <Handle type="target" position={Position.Top} id="top" style={{ top: '-2px', opacity: 0, background: 'transparent', border: 'none' }} />

      {/* Outer circle */}
      <motion.div
        animate={{ scale: isActive ? 1.15 : isHovered ? 1.08 : 1, ...ringStyle }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`
          relative flex items-center justify-center
          w-16 h-16 rounded-full border-2 ${outerRing}
          shadow-md transition-all duration-200
        `}
        style={{ backdropFilter: 'blur(8px)' }}
      >
        {/* Accept state double-ring */}
        {isAccept && (
          <div className="absolute inset-1.5 rounded-full border-2 border-emerald-400/70 pointer-events-none" />
        )}

        {/* Inner label */}
        <div className={`${innerColor} rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200`}>
          <span className={`text-[11px] font-bold mono ${textColor} transition-colors duration-200`}>{label}</span>
        </div>
      </motion.div>

      {/* Right handle — for outgoing regular transitions */}
      <Handle type="source" position={Position.Right} id="right" style={{ right: '-2px', opacity: 0, background: 'transparent', border: 'none' }} />
      {/* Top source handle — for self-loop outgoing */}
      <Handle type="source" position={Position.Top} id="top-source" style={{ top: '-2px', opacity: 0, background: 'transparent', border: 'none' }} />
    </>
  );
}

export default memo(NFANode);
