/**
 * App.tsx — Root component. Assembles all sections.
 */
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';
import AppShell from './components/layout/AppShell';
import RegexInput from './components/input/RegexInput';
import StringInput from './components/input/StringInput';
import NFAVisualizer from './components/nfa/NFAVisualizer';
import CFGDisplay from './components/cfg/CFGDisplay';
import DerivationPanel from './components/derivation/DerivationPanel';
import { useAppStore } from './store/appStore';

export default function App() {
  const { nfa, cfg, pipelineStatus } = useAppStore();
  const hasResult = pipelineStatus === 'success' && nfa && cfg;

  return (
    <AppShell>
      {/* ── Top Navigation Bar ──────────────────────────────────── */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md flex flex-col md:flex-row items-center px-8 py-3.5 gap-8 shrink-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <Cpu size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            LexiFlow
          </h1>
        </div>

        {/* Centered Input Bar */}
        <div className="flex-1 flex justify-center w-full min-w-0">
          <div className="w-full max-w-3xl min-w-0">
            <RegexInput />
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-6 shrink-0">
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Environment</span>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Client-Side</span>
          </div>
          <div className="w-[1px] h-8 bg-slate-200" />
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Stack</span>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Vite + TS</span>
          </div>
        </div>

      </header>

      {/* ── Main Body ───────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {hasResult ? (
          <>
            {/* Left Sidebar: Grammar & Rules */}
            <aside className="w-[320px] flex-none border-r border-slate-200 bg-white shrink-0 flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 p-6 flex flex-col">
                <CFGDisplay cfg={cfg} />
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
              {/* Top: Automaton Canvas */}
              <div className="flex-1 relative min-h-0 z-10 p-6">
                <div className="w-full h-full bg-white border border-slate-200 shadow-sm overflow-hidden relative">
                  <NFAVisualizer nfa={nfa} />
                </div>
              </div>

              {/* Bottom: Derivation Console */}
              <footer className="h-[35vh] min-h-[300px] max-h-[450px] flex-none border-t border-slate-200 bg-white z-20">
                <div className="w-full h-full flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200 overflow-hidden">
                  {/* Left: String Input */}
                  <div className="lg:w-[360px] flex-none p-6 overflow-y-auto">
                    <StringInput />
                  </div>
                  {/* Right: Derivation Trace */}
                  <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
                    <DerivationPanel />
                  </div>
                </div>
              </footer>
            </main>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-slate-200">
                <Cpu size={48} strokeWidth={1} />
              </div>
              <div className="text-center max-w-sm">
                <h2 className="text-xl font-semibold text-slate-400 mb-2">Initialize Workspace</h2>
                <p className="text-sm">Enter a regular expression in the header bar above to generate the NFA and Grammar structures.</p>
              </div>
              <div className="flex gap-4 mt-4 px-6 py-3 rounded-2xl bg-slate-100/50 border border-slate-200/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Regex</span>
                <span className="text-slate-200">→</span>
                <span>NFA</span>
                <span className="text-slate-200">→</span>
                <span>CFG</span>
                <span className="text-slate-200">→</span>
                <span>Test</span>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
