// ─── NFA ────────────────────────────────────────────────────────────────────

export interface NFAState {
  id: string;
  isStart: boolean;
  isAccept: boolean;
}

export interface NFATransition {
  from: string;
  symbol: string | null; // null = ε (epsilon)
  to: string;
}

export interface NFA {
  states: NFAState[];
  transitions: NFATransition[];
  start: string;
  accept: string[];
}

// ─── CFG ────────────────────────────────────────────────────────────────────

/** A single production rule: lhs → rhs[0] rhs[1] …
 *  null inside rhs means ε (empty string). */
export interface CFGRule {
  lhs: string;       // e.g. "Q0"
  rhs: string[];     // e.g. ["a", "Q1"] or [] for ε
}

export interface CFG {
  startSymbol: string;
  rules: CFGRule[];
}

// ─── Derivation ──────────────────────────────────────────────────────────────

export interface DerivationStep {
  sententialForm: string;   // e.g. "a Q1"
  ruleApplied: string;      // human-readable, e.g. "Q0 → a Q1"
}
