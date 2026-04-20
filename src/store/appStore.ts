/**
 * appStore.ts
 * Global Zustand store — single source of truth for the entire pipeline.
 */
import { create } from 'zustand';
import type { NFA, CFG, DerivationStep } from '../lib/types';

export type PipelineStatus = 'idle' | 'processing' | 'success' | 'error';

interface AppState {
  // ── Inputs ────────────────────────────────────────────────────
  regexInput: string;
  testString: string;

  // ── Pipeline outputs ──────────────────────────────────────────
  nfa: NFA | null;
  dfa: NFA | null;
  cfg: CFG | null;

  // ── Canvas view ───────────────────────────────────────────────
  canvasView: 'nfa' | 'dfa';

  // ── Derivation ────────────────────────────────────────────────
  derivationSteps: DerivationStep[];
  currentStep: number;        // index of the currently displayed step
  isPlaying: boolean;
  derivationFound: boolean;
  derivationReason: string;

  // ── Status ────────────────────────────────────────────────────
  pipelineStatus: PipelineStatus;
  derivationStatus: PipelineStatus;
  error: string | null;

  // ── Hover Sync ────────────────────────────────────────────────
  hoveredRule: string | null;

  // ── Actions ───────────────────────────────────────────────────
  setRegexInput: (v: string) => void;
  setTestString: (v: string) => void;
  setNFA: (nfa: NFA) => void;
  setDFA: (dfa: NFA) => void;
  setCFG: (cfg: CFG) => void;
  setCanvasView: (view: 'nfa' | 'dfa') => void;
  setPipelineStatus: (s: PipelineStatus) => void;
  setError: (e: string | null) => void;
  setDerivation: (
    steps: DerivationStep[],
    found: boolean,
    reason: string
  ) => void;
  setDerivationStatus: (s: PipelineStatus) => void;

  // Playback controls
  nextStep: () => void;
  prevStep: () => void;
  setCurrentStep: (n: number) => void;
  setIsPlaying: (v: boolean) => void;
  resetDerivation: () => void;

  // Full reset
  reset: () => void;

  // Sync
  setHoveredRule: (r: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // ── Initial state ─────────────────────────────────────────────
  regexInput: '',
  testString: '',
  nfa: null,
  dfa: null,
  cfg: null,
  canvasView: 'nfa',
  derivationSteps: [],
  currentStep: -1,
  isPlaying: false,
  derivationFound: false,
  derivationReason: '',
  pipelineStatus: 'idle',
  derivationStatus: 'idle',
  error: null,
  hoveredRule: null,

  // ── Setters ───────────────────────────────────────────────────
  setRegexInput: (v) => set({ regexInput: v }),
  setTestString: (v) => set({ testString: v }),
  setNFA: (nfa) => set({ nfa }),
  setDFA: (dfa) => set({ dfa }),
  setCFG: (cfg) => set({ cfg }),
  setCanvasView: (view) => set({ canvasView: view }),
  setPipelineStatus: (s) => set({ pipelineStatus: s }),
  setError: (e) => set({ error: e }),
  setDerivation: (steps, found, reason) =>
    set({
      derivationSteps: steps,
      currentStep: steps.length > 0 ? 0 : -1,
      derivationFound: found,
      derivationReason: reason,
    }),
  setDerivationStatus: (s) => set({ derivationStatus: s }),
  setHoveredRule: (r) => set({ hoveredRule: r }),

  // ── Playback ──────────────────────────────────────────────────
  nextStep: () => {
    const { currentStep, derivationSteps } = get();
    if (currentStep < derivationSteps.length - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      set({ isPlaying: false });
    }
  },
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) set({ currentStep: currentStep - 1 });
  },
  setCurrentStep: (n) => set({ currentStep: n }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  resetDerivation: () =>
    set({
      derivationSteps: [],
      currentStep: -1,
      isPlaying: false,
      derivationFound: false,
      derivationReason: '',
      derivationStatus: 'idle',
    }),

  // ── Full reset ────────────────────────────────────────────────
  reset: () =>
    set({
      nfa: null,
      dfa: null,
      cfg: null,
      canvasView: 'nfa',
      derivationSteps: [],
      currentStep: -1,
      isPlaying: false,
      derivationFound: false,
      derivationReason: '',
      pipelineStatus: 'idle',
      derivationStatus: 'idle',
      error: null,
    }),
}));
