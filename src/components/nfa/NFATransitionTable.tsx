/**
 * NFATransitionTable.tsx — Professional grid view of NFA transitions.
 */
import { motion } from 'framer-motion';
import type { NFA } from '../../lib/types';

interface NFATransitionTableProps {
  nfa: NFA;
}

export default function NFATransitionTable({ nfa }: NFATransitionTableProps) {
  // Extract unique symbols (alphabet)
  const alphabet = Array.from(
    new Set(nfa.transitions.map((t) => t.symbol).filter((s) => s !== null))
  ).sort() as string[];

  const columns = ['State', ...alphabet, 'ε'];

  return (
    <div className="w-full overflow-x-auto border border-slate-200/60 rounded-xl bg-white shadow-sm">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-[12px] font-extrabold text-slate-400 uppercase tracking-widest"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {nfa.states.map((state, idx) => {
            const isStart = state.id === nfa.start;
            const isAccept = nfa.accept.includes(state.id);

            return (
              <motion.tr
                key={state.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="hover:bg-slate-50/30 transition-colors"
              >
                {/* State Column */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`
                        mono text-sm font-bold px-2 py-0.5 rounded-md
                        ${
                          isStart
                            ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'
                            : isAccept
                            ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }
                      `}
                    >
                      {state.id}
                    </span>
                    {isStart && (
                      <span className="text-[10px] font-black text-indigo-400/80 uppercase tracking-tighter">S</span>
                    )}
                    {isAccept && (
                      <span className="text-[10px] font-black text-emerald-400/80 uppercase tracking-tighter">A</span>
                    )}
                  </div>
                </td>

                {/* Symbol Columns */}
                {alphabet.map((sym) => {
                  const destinations = nfa.transitions
                    .filter((t) => t.from === state.id && t.symbol === sym)
                    .map((t) => t.to);

                  return (
                    <td key={sym} className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {destinations.length > 0 ? (
                          destinations.map((dest) => (
                            <span key={dest} className="mono text-[11px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                              {dest}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-200">—</span>
                        )}
                      </div>
                    </td>
                  );
                })}

                {/* Epsilon Column */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {nfa.transitions
                      .filter((t) => t.from === state.id && t.symbol === null)
                      .map((t) => (
                        <span key={t.to} className="mono text-[11px] text-indigo-400 bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100/50">
                          {t.to}
                        </span>
                      ))}
                    {nfa.transitions.filter((t) => t.from === state.id && t.symbol === null).length === 0 && (
                      <span className="text-slate-200">—</span>
                    )}
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>

      </table>
    </div>
  );
}
