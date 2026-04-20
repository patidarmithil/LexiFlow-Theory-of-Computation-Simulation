import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Table as TableIcon, List } from 'lucide-react';
import CFGRuleRow from './CFGRule';
import NFATransitionTable from '../nfa/NFATransitionTable';
import { useAppStore } from '../../store/appStore';
import type { CFG } from '../../lib/types';

interface CFGDisplayProps {
  cfg: CFG;
}

export default function CFGDisplay({ cfg }: CFGDisplayProps) {
  const [view, setView] = useState<'rules' | 'table'>('rules');
  const { nfa } = useAppStore();

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between">
        <div className="premium-label">
          <BookOpen size={14} className="text-indigo-600" strokeWidth={2.5} />
          <span>Logic</span>
        </div>

        {/* View Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setView('rules')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all
              ${view === 'rules' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            <List size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Rules</span>
          </button>
          <button
            onClick={() => setView('table')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all
              ${view === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            <TableIcon size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Table</span>
          </button>
        </div>

      </div>

      {/* Subtitle */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 leading-relaxed">
          {view === 'rules' 
            ? "Each NFA state Qi becomes a non-terminal. Transitions produce production rules."
            : "Formal representation of the NFA's transition function (δ)."}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-2">
        <StatPill label="States" value={nfa?.states.length || 0} />
        <StatPill label="Transitions" value={nfa?.transitions.length || 0} highlight />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {view === 'rules' ? (
            <motion.div
              key="rules"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex-1 overflow-y-auto pr-4 -mr-2 flex flex-col gap-1.5"
            >
              {cfg.rules.map((rule, i) => (
                <CFGRuleRow
                  key={`${rule.lhs}-${rule.rhs.join('')}-${i}`}
                  rule={rule}
                  index={i}
                  isStartRule={rule.lhs === cfg.startSymbol}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 overflow-y-auto"
            >
              {nfa && <NFATransitionTable nfa={nfa} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


function StatPill({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <span
      className={`
        px-2.5 py-1 text-[10px] font-bold rounded-lg border shadow-sm
        ${
          highlight
            ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
            : 'bg-white border-slate-200 text-slate-500'
        }
      `}
    >
      {label.toUpperCase()}:{' '}
      <span className={`mono ${highlight ? 'text-indigo-900' : 'text-slate-900'}`}>{value}</span>
    </span>
  );
}
