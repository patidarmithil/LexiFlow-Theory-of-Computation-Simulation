/**
 * useRegexPipeline.ts
 * Orchestrates: RE string → NFA → DFA → CFG
 * Reads/writes via the Zustand store.
 */
import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { regexToNFA } from '../lib/thompson';
import { nfaToCFG } from '../lib/nfa-to-cfg';
import { nfaToDFA } from '../lib/nfa-to-dfa';

export function useRegexPipeline() {
  const {
    regexInput,
    setPipelineStatus,
    setNFA,
    setDFA,
    setCFG,
    setError,
    resetDerivation,
    reset,
  } = useAppStore();

  const run = useCallback(() => {
    if (!regexInput.trim()) {
      setError('Please enter a regular expression.');
      return;
    }

    reset();
    setPipelineStatus('processing');

    // Use setTimeout to allow the UI to re-render the loading state first
    setTimeout(() => {
      try {
        const nfa = regexToNFA(regexInput.trim());
        const dfa = nfaToDFA(nfa);
        const cfg = nfaToCFG(nfa);
        setNFA(nfa);
        setDFA(dfa);
        setCFG(cfg);
        setPipelineStatus('success');
        setError(null);
        resetDerivation();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(message);
        setPipelineStatus('error');
      }
    }, 50);
  }, [regexInput, reset, setPipelineStatus, setNFA, setDFA, setCFG, setError, resetDerivation]);

  return { run };
}

