/**
 * nfa-to-dfa.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Implements the Subset Construction (Powerset Construction) algorithm to
 * convert an ε-NFA to an equivalent DFA.
 *
 * Each DFA state represents a SET of NFA states.
 * The DFA has no ε-transitions and is fully deterministic.
 *
 * Output uses the same NFA interface for visualization compatibility.
 * State IDs are named D0, D1, D2 … for readability.
 */
import type { NFA, NFAState, NFATransition } from './types';
import { epsilonClosure } from './nfa-simulator';

// ─── Subset Construction ─────────────────────────────────────────────────────

export function nfaToDFA(nfa: NFA): NFA {
  // Extract the alphabet (all non-ε symbols)
  const alphabet = Array.from(
    new Set(nfa.transitions.map((t) => t.symbol).filter((s) => s !== null) as string[])
  ).sort();

  const acceptSet = new Set(nfa.accept);

  // Map from serialized NFA state-set → DFA state id
  const dfaStateMap = new Map<string, string>();
  let dfaCounter = 0;

  const serializeSet = (states: Set<string>): string =>
    [...states].sort().join(',');

  const getDFAId = (states: Set<string>): string => {
    const key = serializeSet(states);
    if (!dfaStateMap.has(key)) {
      dfaStateMap.set(key, `D${dfaCounter++}`);
    }
    return dfaStateMap.get(key)!;
  };

  // Lookup: DFA id → NFA state set
  const dfaIdToNFASet = new Map<string, Set<string>>();

  // ε-closure of start state
  const startClosure = epsilonClosure(new Set([nfa.start]), nfa.transitions);
  const startId = getDFAId(startClosure);
  dfaIdToNFASet.set(startId, startClosure);

  const worklist: string[] = [startId];
  const visited = new Set<string>([startId]);

  const dfaStates: NFAState[] = [];
  const dfaTransitions: NFATransition[] = [];
  const dfaAccept: string[] = [];

  while (worklist.length > 0) {
    const currentId = worklist.pop()!;
    const currentNFAStates = dfaIdToNFASet.get(currentId)!;

    // Determine if this DFA state is an accept state
    const isAccept = [...currentNFAStates].some((s) => acceptSet.has(s));
    const isStart = currentId === startId;

    dfaStates.push({ id: currentId, isStart, isAccept });
    if (isAccept) dfaAccept.push(currentId);

    // For each symbol in the alphabet, compute the target DFA state
    for (const symbol of alphabet) {
      // Move: all NFA states reachable via `symbol` from currentNFAStates
      const moved = new Set<string>();
      for (const state of currentNFAStates) {
        for (const t of nfa.transitions) {
          if (t.from === state && t.symbol === symbol) {
            moved.add(t.to);
          }
        }
      }

      if (moved.size === 0) continue; // dead transition (no transition on this symbol)

      // ε-closure of moved set
      const closure = epsilonClosure(moved, nfa.transitions);
      const targetId = getDFAId(closure);

      // Add DFA transition
      dfaTransitions.push({ from: currentId, symbol, to: targetId });

      // Add new DFA state to worklist if not yet visited
      if (!visited.has(targetId)) {
        visited.add(targetId);
        dfaIdToNFASet.set(targetId, closure);
        worklist.push(targetId);
      }
    }
  }

  return {
    states: dfaStates,
    transitions: dfaTransitions,
    start: startId,
    accept: dfaAccept,
  };
}

// ─── DFA Simulation (deterministic) ─────────────────────────────────────────

/**
 * Simulate the DFA on `input`. Returns true if accepted.
 * Much simpler than NFA simulation — fully deterministic, no ε-closure needed.
 */
export function dfaAccepts(dfa: NFA, input: string): boolean {
  let currentState = dfa.start;
  const acceptSet = new Set(dfa.accept);

  for (const symbol of input) {
    const transition = dfa.transitions.find(
      (t) => t.from === currentState && t.symbol === symbol
    );
    if (!transition) return false; // no transition = dead state = reject
    currentState = transition.to;
  }

  return acceptSet.has(currentState);
}
