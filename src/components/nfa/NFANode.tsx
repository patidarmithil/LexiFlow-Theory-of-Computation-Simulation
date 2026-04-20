/**
 * NFANode.tsx — Custom React Flow node for NFA states.
 *
 * Variants:
 *   - Start state:  blue ring
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
}

function NFANode({ data }: { data: NFANodeData }) {
  const { label, isStart, isAccept, isActive, isHovered } = data;

  let outerRing = 'border-slate-300 bg-white/70';
  let innerColor = 'bg-slate-100/80';
  let textColor = 'text-slate-700';

  if (isStart && isAccept) {
    outerRing = 'border-violet-400 bg-violet-50/70';
    innerColor = 'bg-violet-100/60';
    textColor = 'text-violet-800';
  } else if (isStart) {
    outerRing = 'border-blue-400 bg-blue-50/70';
    innerColor = 'bg-blue-100/60';
    textColor = 'text-blue-800';
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
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />

      {/* Outer circle */}
      <motion.div
        animate={{ scale: isActive ? 1.15 : isHovered ? 1.08 : 1, ...ringStyle }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`
          relative flex items-center justify-center
          w-12 h-12 rounded-full border-2 ${outerRing}
          shadow-md transition-all duration-200
        `}
        style={{ backdropFilter: 'blur(8px)' }}
      >
        {/* Accept state double-ring */}
        {isAccept && (
          <div className="absolute inset-1 rounded-full border-2 border-emerald-400/70 pointer-events-none" />
        )}

        {/* Inner label */}
        <div className={`${innerColor} rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200`}>
          <span className={`text-[10px] font-bold mono ${textColor} transition-colors duration-200`}>{label}</span>
        </div>
      </motion.div>

      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </>
  );
}

export default memo(NFANode);
