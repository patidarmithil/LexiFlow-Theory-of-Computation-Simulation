/**
 * useDerivation.ts
 * Manages step playback: auto-advance timer, play/pause, next/prev.
 * Acceptance is determined by DFA simulation (always correct).
 * The CFG derivation steps are shown for educational/display purposes.
 */
import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { deriveString } from '../lib/derivation-engine';
import { dfaAccepts } from '../lib/nfa-to-dfa';

const STEP_INTERVAL_MS = 1200;

export function useDerivation() {
  const {
    cfg,
    dfa,
    testString,
    isPlaying,
    currentStep,
    derivationSteps,
    setDerivation,
    setDerivationStatus,
    setIsPlaying,
    nextStep,
    prevStep,
    setCurrentStep,
    resetDerivation,
  } = useAppStore();

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      const { currentStep, derivationSteps, isPlaying } = useAppStore.getState();
      if (!isPlaying) return;
      if (currentStep >= derivationSteps.length - 1) {
        useAppStore.getState().setIsPlaying(false);
      } else {
        useAppStore.getState().nextStep();
      }
    }, STEP_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const runDerivation = useCallback(() => {
    if (!cfg || !dfa) return;
    resetDerivation();
    setDerivationStatus('processing');

    setTimeout(() => {
      try {
        // ── Ground-truth acceptance via DFA simulation ──────────────
        const accepted = dfaAccepts(dfa, testString);

        if (!accepted) {
          // DFA rejects — report immediately, no need to run CFG BFS
          setDerivation(
            [],
            false,
            `"${testString || 'ε'}" is not in the language (Automaton rejects).`
          );
          setDerivationStatus('success');
          return;
        }

        // ── String is accepted — run CFG BFS for the derivation trace ──
        const result = deriveString(cfg, testString);

        if (result.found) {
          setDerivation(result.steps, true, '');
        } else {
          // DFA accepted but CFG BFS couldn't find a trace (search limit).
          // Still mark as accepted with a note.
          setDerivation(
            [],
            true,
            'Accepted. Grammar trace unavailable (search limit reached).'
          );
        }
        setDerivationStatus('success');
      } catch {
        setDerivationStatus('error');
      }
    }, 50);
  }, [cfg, dfa, testString, resetDerivation, setDerivation, setDerivationStatus]);

  const togglePlay = useCallback(() => {
    const { isPlaying, currentStep, derivationSteps } = useAppStore.getState();
    // If at the end, restart from beginning
    if (!isPlaying && currentStep >= derivationSteps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  }, [setIsPlaying, setCurrentStep]);

  return {
    runDerivation,
    togglePlay,
    nextStep,
    prevStep,
    setCurrentStep,
    currentStep,
    totalSteps: derivationSteps.length,
    isPlaying,
  };
}

