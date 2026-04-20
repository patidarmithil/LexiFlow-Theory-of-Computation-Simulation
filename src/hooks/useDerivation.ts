/**
 * useDerivation.ts
 * Manages step playback: auto-advance timer, play/pause, next/prev.
 */
import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { deriveString } from '../lib/derivation-engine';

const STEP_INTERVAL_MS = 1200;

export function useDerivation() {
  const {
    cfg,
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
    if (!cfg) return;
    resetDerivation();
    setDerivationStatus('processing');

    setTimeout(() => {
      try {
        const result = deriveString(cfg, testString);
        setDerivation(result.steps, result.found, result.reason ?? '');
        setDerivationStatus('success');
      } catch {
        setDerivationStatus('error');
      }
    }, 50);
  }, [cfg, testString, resetDerivation, setDerivation, setDerivationStatus]);

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
