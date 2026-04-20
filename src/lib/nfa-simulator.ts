/**
 * nfa-simulator.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Directly simulates an ε-NFA on an input string using ε-closure.
 * This is the ground-truth acceptance engine — always correct.
 *
 * Algorithm:
 *   1. Start with ε-closure of the NFA's start state.
 *   2. For each symbol in the input, compute the set of reachable states
 *      via that symbol, then take the ε-closure of those states.
 *   3. After all symbols, accept if any current state is an accept state.
 */
import type { NFA, NFATransition } from './types';

// ─── ε-Closure ───────────────────────────────────────────────────────────────

/**
 * Compute the ε-closure of a set of states.
 * Returns all states reachable from `states` via zero or more ε-transitions.
 */
export function epsilonClosure(
  states: Set<string>,
  transitions: NFATransition[]
): Set<string> {
  const closure = new Set<string>(states);
  const stack = [...states];

  while (stack.length > 0) {
    const s = stack.pop()!;
    for (const t of transitions) {
      if (t.from === s && t.symbol === null && !closure.has(t.to)) {
        closure.add(t.to);
        stack.push(t.to);
      }
    }
  }

  return closure;
}

// ─── NFA Simulation ──────────────────────────────────────────────────────────

/**
 * Simulate the NFA on `input`. Returns true if the NFA accepts the string.
 */
export function nfaAccepts(nfa: NFA, input: string): boolean {
  const acceptSet = new Set(nfa.accept);

  // Start: ε-closure of the start state
  let currentStates = epsilonClosure(new Set([nfa.start]), nfa.transitions);

  for (const symbol of input) {
    // Move: all states reachable via `symbol` from current states
    const moved = new Set<string>();
    for (const state of currentStates) {
      for (const t of nfa.transitions) {
        if (t.from === state && t.symbol === symbol) {
          moved.add(t.to);
        }
      }
    }

    // ε-closure of moved states
    currentStates = epsilonClosure(moved, nfa.transitions);

    // Early exit: if no states, reject immediately
    if (currentStates.size === 0) return false;
  }

  // Accept if any current state is an accept state
  for (const s of currentStates) {
    if (acceptSet.has(s)) return true;
  }
  return false;
}
