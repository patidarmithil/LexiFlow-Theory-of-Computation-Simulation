/**
 * StringInput.tsx
 * Input for the test string used in CFG derivation.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import Button from '../ui/Button';
import { useAppStore } from '../../store/appStore';
import { useDerivation } from '../../hooks/useDerivation';

export default function StringInput() {
  const { testString, setTestString, cfg, derivationStatus } = useAppStore();
  const { runDerivation } = useDerivation();
  const [focused, setFocused] = useState(false);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && cfg) runDerivation();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="premium-label">
        <GitBranch size={14} className="text-emerald-500" strokeWidth={2.5} />
        <span>Test String</span>
      </div>


      <p className="text-xs text-slate-500 leading-relaxed">
        Enter a string to test against the generated grammar. The derivation engine will
        find a leftmost derivation if the string is in the language (max 15 chars).
      </p>

      <div className="flex flex-col gap-3">
        {/* Input */}
        <motion.div
          animate={{
            boxShadow: focused
              ? '0 0 0 3px rgba(16,185,129,0.1), 0 2px 8px rgba(16,185,129,0.05)'
              : '0 0 0 1px rgba(203,213,225,0.3)',
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <input
            id="string-input"
            type="text"
            value={testString}
            onChange={(e) => setTestString(e.target.value.slice(0, 15))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKey}
            placeholder='e.g. "aab"  (or empty for ε)'
            disabled={!cfg}
            spellCheck={false}
            autoComplete="off"
            maxLength={15}
            className="
              w-full bg-slate-50 px-4 py-2.5 text-sm mono text-slate-800
              placeholder:text-slate-300 outline-none
              border border-slate-200
              disabled:opacity-50
            "
            aria-label="Test string input for CFG derivation"
          />
        </motion.div>

        <Button
          id="derive-btn"
          variant="primary"
          onClick={runDerivation}
          loading={derivationStatus === 'processing'}
          disabled={!cfg}
          className="w-full !from-emerald-600 !to-emerald-700 !shadow-sm !rounded-none"
        >
          Derive String
        </Button>
      </div>

      {/* Empty string note */}
      {cfg && testString === '' && (
        <p className="text-[11px] text-slate-400 italic pl-1">
          Leaving the field empty will test derivation of ε (empty string).
        </p>
      )}
    </div>
  );
}
