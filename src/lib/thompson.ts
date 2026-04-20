/**
 * thompson.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Thompson's Construction algorithm.
 * Converts a postfix token array (from regex-parser.ts) into an NFA.
 *
 * Each operator pops NFA "fragments" from a stack and creates a new fragment:
 *
 *   LITERAL a  →  q0 —a→ q1
 *   CONCAT  .  →  frag1 then frag2 (connect accept of frag1 to start of frag2 via ε)
 *   UNION   |  →  new start —ε→ frag1 and frag2, both accept —ε→ new accept
 *   KLEENE  *  →  new start —ε→ frag and new accept; frag accept —ε→ frag start and new accept
 *   PLUS    +  →  frag . frag*
 *   OPTIONAL ? →  frag | ε
 */

import type { NFA, NFAState, NFATransition } from './types';
import { parseRegex, type Token } from './regex-parser';

// ─── Fragment ─────────────────────────────────────────────────────────────────

/** A partial NFA with a single start state and single accept state. */
interface Fragment {
  start: string;
  accept: string;
  states: NFAState[];
  transitions: NFATransition[];
}

// ─── State ID counter ────────────────────────────────────────────────────────

let stateCounter = 0;

function freshId(): string {
  return `q${stateCounter++}`;
}

function makeState(id: string, isStart = false, isAccept = false): NFAState {
  return { id, isStart, isAccept };
}

function makeTransition(from: string, to: string, symbol: string | null): NFATransition {
  return { from, symbol, to };
}

// ─── Fragment constructors ────────────────────────────────────────────────────

/** Literal: q0 —symbol→ q1 */
function literalFrag(symbol: string): Fragment {
  const s = freshId();
  const a = freshId();
  return {
    start: s,
    accept: a,
    states: [makeState(s), makeState(a)],
    transitions: [makeTransition(s, a, symbol)],
  };
}

/** Concatenation: frag1 then frag2 */
function concatFrag(f1: Fragment, f2: Fragment): Fragment {
  // Connect f1's accept to f2's start via ε
  const bridge = makeTransition(f1.accept, f2.start, null);
  return {
    start: f1.start,
    accept: f2.accept,
    states: [...f1.states, ...f2.states],
    transitions: [...f1.transitions, bridge, ...f2.transitions],
  };
}

/** Union: new start —ε→ f1.start and f2.start; f1.accept —ε→ new accept; f2.accept —ε→ new accept */
function unionFrag(f1: Fragment, f2: Fragment): Fragment {
  const s = freshId();
  const a = freshId();
  return {
    start: s,
    accept: a,
    states: [...f1.states, ...f2.states, makeState(s), makeState(a)],
    transitions: [
      ...f1.transitions,
      ...f2.transitions,
      makeTransition(s, f1.start, null),
      makeTransition(s, f2.start, null),
      makeTransition(f1.accept, a, null),
      makeTransition(f2.accept, a, null),
    ],
  };
}

/** Kleene star: new start —ε→ f.start and new accept; f.accept —ε→ f.start and new accept */
function kleeneFrag(f: Fragment): Fragment {
  const s = freshId();
  const a = freshId();
  return {
    start: s,
    accept: a,
    states: [...f.states, makeState(s), makeState(a)],
    transitions: [
      ...f.transitions,
      makeTransition(s, f.start, null),
      makeTransition(s, a, null),        // bypass (zero occurrences)
      makeTransition(f.accept, f.start, null), // loop
      makeTransition(f.accept, a, null), // exit loop
    ],
  };
}

/** Plus (one or more): same as f* but without the bypass from start to accept.
 *  Construction:
 *    new start  --ε-->  f.start
 *    f.accept   --ε-->  f.start   (loop: repeat)
 *    f.accept   --ε-->  new accept (exit)
 *  This avoids cloning and keeps the state count minimal.
 */
function plusFrag(f: Fragment): Fragment {
  const s = freshId();
  const a = freshId();
  return {
    start: s,
    accept: a,
    states: [...f.states, makeState(s), makeState(a)],
    transitions: [
      ...f.transitions,
      makeTransition(s, f.start, null),        // enter fragment
      makeTransition(f.accept, f.start, null), // loop back (one-or-more)
      makeTransition(f.accept, a, null),       // exit to accept
    ],
  };
}


/** Optional (zero or one): f | ε */
function optionalFrag(f: Fragment): Fragment {
  const s = freshId();
  const a = freshId();
  return {
    start: s,
    accept: a,
    states: [...f.states, makeState(s), makeState(a)],
    transitions: [
      ...f.transitions,
      makeTransition(s, f.start, null),  // take the fragment
      makeTransition(s, a, null),        // skip (ε path)
      makeTransition(f.accept, a, null), // merge
    ],
  };
}

/** Deep-clone a fragment, assigning fresh state IDs to all states inside it. */
function cloneFrag(f: Fragment): Fragment {
  const idMap = new Map<string, string>();
  const newId = (old: string) => {
    if (!idMap.has(old)) idMap.set(old, freshId());
    return idMap.get(old)!;
  };

  return {
    start: newId(f.start),
    accept: newId(f.accept),
    states: f.states.map(s => makeState(newId(s.id))),
    transitions: f.transitions.map(t => makeTransition(newId(t.from), newId(t.to), t.symbol)),
  };
}

// ─── Main builder ─────────────────────────────────────────────────────────────

/**
 * Build an NFA from a postfix token array produced by parseRegex().
 */
export function buildNFA(postfix: Token[]): NFA {
  stateCounter = 0; // reset for deterministic IDs
  const stack: Fragment[] = [];

  for (const token of postfix) {
    if (token.kind === 'LITERAL') {
      stack.push(literalFrag(token.value));
    } else if (token.kind === 'UNARY_OP') {
      if (stack.length < 1) throw new Error(`Not enough operands for operator '${token.value}'`);
      const f = stack.pop()!;
      if (token.value === '*') stack.push(kleeneFrag(f));
      else if (token.value === '+') stack.push(plusFrag(f));
      else if (token.value === '?') stack.push(optionalFrag(f));
    } else if (token.kind === 'BINARY_OP') {
      if (stack.length < 2) throw new Error(`Not enough operands for operator '${token.value}'`);
      if (token.value === '.') {
        const f2 = stack.pop()!;
        const f1 = stack.pop()!;
        stack.push(concatFrag(f1, f2));
      } else if (token.value === '|') {
        const f2 = stack.pop()!;
        const f1 = stack.pop()!;
        stack.push(unionFrag(f1, f2));
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid regular expression: could not build a single NFA fragment.');
  }

  const root = stack[0];

  // Mark start and accept states
  const stateMap = new Map(root.states.map(s => [s.id, { ...s }]));
  const startState = stateMap.get(root.start)!;
  startState.isStart = true;
  const acceptState = stateMap.get(root.accept)!;
  acceptState.isAccept = true;

  return {
    states: Array.from(stateMap.values()),
    transitions: root.transitions,
    start: root.start,
    accept: [root.accept],
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Convert a regex string directly to an NFA. */
export function regexToNFA(regex: string): NFA {
  const postfix = parseRegex(regex);
  return buildNFA(postfix);
}
