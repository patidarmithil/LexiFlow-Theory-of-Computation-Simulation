/**
 * DerivationStep.tsx — A single animated step row in the derivation panel.
 */
import { motion } from 'framer-motion';

interface DerivationStepProps {
  step: { sententialForm: string; ruleApplied: string };
  index: number;
  isActive: boolean;
  isFinal: boolean;
}

export default function DerivationStep({
  step,
  index,
  isActive,
  isFinal,
}: DerivationStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className={`
        relative flex flex-col gap-0.5 px-3 py-1.5 border-l-4 transition-all
        ${
          isActive
            ? 'bg-indigo-50 border-indigo-500 shadow-sm'
            : isFinal
            ? 'bg-emerald-50 border-emerald-500'
            : 'bg-white border-slate-100 hover:bg-slate-50'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Step index */}
        <span className="text-[10px] text-slate-300 mono w-5 text-right shrink-0">
          {index + 1}
        </span>

        {/* Rule applied */}
        <span className="text-[10px] font-bold text-slate-400 mono uppercase tracking-wider">
           {step.ruleApplied}
        </span>
      </div>

      {/* Sentential form */}
      <div className="pl-8">
        <span
          className={`
            mono text-[13px] font-bold tracking-tight
            ${isActive ? 'text-indigo-700' : isFinal ? 'text-emerald-700' : 'text-slate-900'}
          `}
        >
          {step.sententialForm}
        </span>
      </div>
    </motion.div>
  );
}
