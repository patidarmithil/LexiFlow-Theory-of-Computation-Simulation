/**
 * CFGRule.tsx — Animated single production rule row.
 */
import { motion } from 'framer-motion';
import type { CFGRule as CFGRuleType } from '../../lib/types';
import { useAppStore } from '../../store/appStore';

interface CFGRuleProps {
  rule: CFGRuleType;
  index: number;
  isStartRule: boolean;
}

export default function CFGRuleRow({ rule, index, isStartRule }: CFGRuleProps) {
  const { setHoveredRule } = useAppStore();

  const handleMouseEnter = () => {
    const rhs = rule.rhs.length === 0 ? 'ε' : rule.rhs.join(' ');
    setHoveredRule(`${rule.lhs}->${rhs}`);
  };

  const handleMouseLeave = () => {
    setHoveredRule(null);
  };

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.055,
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-xl
        border transition-all duration-200
        ${
          isStartRule
            ? 'bg-indigo-50/50 border-indigo-100 shadow-sm'
            : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
        }
      `}
    >
      {/* Index */}
      <span className="text-[10px] text-slate-300 mono w-5 text-right shrink-0">
        {index + 1}
      </span>

      {/* LHS */}
      <span
        className={`mono text-sm font-bold shrink-0 ${
          isStartRule ? 'text-indigo-600' : 'text-slate-900'
        }`}
      >
        {rule.lhs}
      </span>

      {/* Arrow */}
      <span className="text-slate-300 text-sm shrink-0 font-light">→</span>

      {/* RHS */}
      <span className="mono text-sm text-slate-700 flex flex-wrap gap-1">
        {rule.rhs.length === 0 ? (
          <span className="text-emerald-500 font-bold">ε</span>
        ) : (
          rule.rhs.map((sym, i) => {
            const isNT = sym.startsWith('Q');
            return (
              <span
                key={i}
                className={`
                  inline-block px-1.5 py-0.5 rounded-md text-[11px] font-bold
                  ${
                    isNT
                      ? 'bg-indigo-100/50 text-indigo-700 border border-indigo-200/40'
                      : 'bg-slate-100 text-slate-600 border border-slate-200/40'
                  }
                `}
              >
                {sym}
              </span>
            );
          })
        )}
      </span>

      {/* Start symbol badge */}
      {isStartRule && (
        <span className="ml-auto text-[9px] font-extrabold text-indigo-400 uppercase tracking-[0.1em] shrink-0">
          START
        </span>
      )}
    </motion.div>
  );
}
