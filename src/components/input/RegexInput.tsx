/**
 * RegexInput.tsx
 * The primary input panel: RE text field, example chips, and the "Visualize" button.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, FlaskConical } from 'lucide-react';
import Button from '../ui/Button';
import { useAppStore } from '../../store/appStore';
import { useRegexPipeline } from '../../hooks/useRegexPipeline';

const EXAMPLES = [
  { label: '(a|b)*', value: '(a|b)*' },
  { label: 'a*b+',   value: 'a*b+' },
  { label: '(a|b)*c', value: '(a|b)*c' },
  { label: '(ab)+',  value: '(ab)+' },
];

export default function RegexInput() {
  const { regexInput, setRegexInput, pipelineStatus, error } = useAppStore();
  const { run } = useRegexPipeline();
  const [focused, setFocused] = useState(false);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') run();
  };

  return (
    <div className="flex flex-col gap-3 items-center">
      <div className="flex items-center gap-4 w-full">
        {/* Label (subtle) */}
        <div className="hidden xl:flex items-center gap-2.5 shrink-0">
          <FlaskConical size={18} className="text-indigo-500" />
          <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-heading)' }}>Workspace</h2>
        </div>

        {/* Input area */}
        <div className="flex-1 relative min-w-0">
          <motion.div
            animate={{
              boxShadow: focused
                ? '0 0 0 3px rgba(79,70,229,0.08), 0 4px 20px rgba(79,70,229,0.05)'
                : '0 0 0 1px rgba(226,232,240,0.8)',
            }}
            transition={{ duration: 0.2 }}
            className="rounded-xl overflow-hidden bg-white shadow-sm"
          >
            <input
              id="regex-input"
              type="text"
              value={regexInput}
              onChange={(e) => setRegexInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKey}
              placeholder="Enter regular expression (e.g. (a|b)*c)"
              spellCheck={false}
              autoComplete="off"
              className="
                w-full bg-transparent px-4 py-2.5 text-base mono text-slate-800
                placeholder:text-slate-300 outline-none
              "
              aria-label="Regular expression input"
            />
          </motion.div>
        </div>

        {/* Action Button */}
        <Button
          id="visualize-btn"
          variant="primary"
          size="lg"
          onClick={run}
          loading={pipelineStatus === 'processing'}
          disabled={!regexInput.trim()}
          className="shrink-0"
        >
          <Sparkles size={18} />
          <span>Visualize</span>
        </Button>
      </div>

      {/* Footer row: Examples & Error (Centered) */}
      <div className="flex items-center justify-center gap-6 w-full">
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>Quick Presets:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.value}
              onClick={() => setRegexInput(ex.value)}
              className="
                px-2.5 py-0.5 text-[10px] mono font-bold
                rounded-full border border-slate-200
                bg-white text-slate-500 shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                hover:bg-indigo-50 hover:text-indigo-600 
                hover:border-indigo-100 transition-all
              "
            >
              {ex.label}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-1.5 text-rose-500 text-[11px] font-bold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <AlertCircle size={13} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
