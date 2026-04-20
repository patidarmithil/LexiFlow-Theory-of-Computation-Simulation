/**
 * derivation-engine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * BFS-based leftmost derivation engine for Right-Linear CFGs.
 *
 * Given a CFG and a target string, finds a leftmost derivation sequence
 * (if one exists) by systematically applying production rules to the
 * leftmost non-terminal in the current sentential form.
 *
 * A sentential form is stored as an array of symbols (terminals + non-terminals).
 * Non-terminals are identified by starting with an uppercase letter and being
 * present in the grammar's non-terminal set.
 *
 * Caps:
 *   - Max string length: 15 characters (per spec)
 *   - Max BFS queue size: 10,000 nodes
 */

import type { CFG, CFGRule, DerivationStep } from './types';

const MAX_STRING_LENGTH = 15;
const MAX_QUEUE = 10_000;

// ─── Types ────────────────────────────────────────────────────────────────────

type Symbol = string; // either a terminal like 'a' or a non-terminal like 'Q0'

interface BFSNode {
  form: Symbol[];           // current sentential form
  steps: DerivationStep[];  // path of steps taken so far
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build the set of non-terminal symbols from the CFG's rule LHS values. */
function buildNTSet(cfg: CFG): Set<string> {
  const nts = new Set<string>();
  for (const rule of cfg.rules) {
    nts.add(rule.lhs);
  }
  return nts;
}

/** Serialize a sentential form for visited-set deduplication. */
function serialize(form: Symbol[]): string {
  return form.join('\x00');
}

/** Render a sentential form as a human-readable string for display. */
function renderForm(form: Symbol[]): string {
  if (form.length === 0) return 'ε';
  return form.join(' ');
}

/** Find the index of the leftmost non-terminal in the sentential form, or -1. */
function leftmostNT(form: Symbol[], ntSet: Set<string>): number {
  for (let i = 0; i < form.length; i++) {
    if (ntSet.has(form[i])) return i;
  }
  return -1;
}

/** Apply a rule to a sentential form at position `pos` of the leftmost NT. */
function applyRule(form: Symbol[], pos: number, rule: CFGRule): Symbol[] {
  return [...form.slice(0, pos), ...rule.rhs, ...form.slice(pos + 1)];
}

/** Count terminal characters in a form (used for length pruning). */
function terminalLength(form: Symbol[], ntSet: Set<string>): number {
  return form.filter(s => !ntSet.has(s)).length;
}

// ─── Build a lookup map: NT → rules ──────────────────────────────────────────

function buildRuleMap(cfg: CFG): Map<string, CFGRule[]> {
  const map = new Map<string, CFGRule[]>();
  for (const rule of cfg.rules) {
    if (!map.has(rule.lhs)) map.set(rule.lhs, []);
    map.get(rule.lhs)!.push(rule);
  }
  return map;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface DerivationResult {
  found: boolean;
  steps: DerivationStep[];
  reason?: string; // explanation when not found
}

/**
 * Attempt to derive `targetString` from the CFG using BFS leftmost derivation.
 * Returns an ordered array of DerivationStep objects if the string is in the language,
 * or null with a reason if it is not (within the search bounds).
 */
export function deriveString(cfg: CFG, targetString: string): DerivationResult {
  if (targetString.length > MAX_STRING_LENGTH) {
    return {
      found: false,
      steps: [],
      reason: `String length exceeds the ${MAX_STRING_LENGTH}-character cap.`,
    };
  }

  const ntSet = buildNTSet(cfg);
  const ruleMap = buildRuleMap(cfg);
  const target = targetString === '' ? [] : targetString.split('');

  const initialForm: Symbol[] = [cfg.startSymbol];
  const initialNode: BFSNode = { form: initialForm, steps: [] };

  const queue: BFSNode[] = [initialNode];
  const visited = new Set<string>([serialize(initialForm)]);

  let processed = 0;

  while (queue.length > 0 && processed < MAX_QUEUE) {
    const node = queue.shift()!;
    processed++;

    const { form, steps } = node;

    // Find leftmost non-terminal
    const ntIdx = leftmostNT(form, ntSet);

    if (ntIdx === -1) {
      // Fully derived — no NTs left; check if it matches the target
      if (form.length === target.length && form.every((s, i) => s === target[i])) {
        return { found: true, steps };
      }
      continue; // terminal string that doesn't match
    }

    const nt = form[ntIdx];
    const rules = ruleMap.get(nt) ?? [];

    for (const rule of rules) {
      const newForm = applyRule(form, ntIdx, rule);

      // Prune: if terminal characters already exceed target length, skip
      if (terminalLength(newForm, ntSet) > target.length) continue;

      // Prune: if string length already unreasonably long
      if (newForm.length > target.length + 20) continue;

      const key = serialize(newForm);
      if (visited.has(key)) continue;
      visited.add(key);

      const ruleStr = `${rule.lhs} → ${rule.rhs.length === 0 ? 'ε' : rule.rhs.join(' ')}`;
      const newStep: DerivationStep = {
        sententialForm: renderForm(newForm),
        ruleApplied: ruleStr,
      };

      queue.push({ form: newForm, steps: [...steps, newStep] });
    }
  }

  return {
    found: false,
    steps: [],
    reason:
      processed >= MAX_QUEUE
        ? 'Search limit reached. The string may not be in this language.'
        : `"${targetString || 'ε'}" is not in the language described by this grammar.`,
  };
}

/** Quick membership test — returns true/false without the full step trace. */
export function acceptsString(cfg: CFG, s: string): boolean {
  return deriveString(cfg, s).found;
}
