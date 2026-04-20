/**
 * nfa-to-cfg.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Converts an NFA to a Right-Linear Context-Free Grammar (CFG).
 *
 * The mapping is a direct 1:1 correspondence (raw rules, no simplification):
 *
 *   NFA transition  qi —a→ qj   →  CFG rule  Qi → a Qj
 *   NFA transition  qi —ε→ qj   →  CFG rule  Qi → Qj
 *   qi is an accept state        →  CFG rule  Qi → ε  (represented as empty rhs)
 *
 * Non-terminal names: state id "q0" → "Q0"
 */

import type { NFA, CFG, CFGRule } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a state id (e.g. "q0") to a CFG non-terminal (e.g. "Q0"). */
export function stateToNT(stateId: string): string {
  // q7 → Q7, handles multi-digit ids
  return 'Q' + stateId.slice(1);
}

// ─── Main converter ───────────────────────────────────────────────────────────

export function nfaToCFG(nfa: NFA): CFG {
  const rules: CFGRule[] = [];

  // 1. For every transition, emit a production rule
  for (const t of nfa.transitions) {
    const lhs = stateToNT(t.from);
    if (t.symbol === null) {
      // ε-transition: Qi → Qj
      rules.push({ lhs, rhs: [stateToNT(t.to)] });
    } else {
      // Symbol transition: Qi → a Qj
      rules.push({ lhs, rhs: [t.symbol, stateToNT(t.to)] });
    }
  }

  // 2. For every accept state, emit Qi → ε
  for (const acceptId of nfa.accept) {
    const lhs = stateToNT(acceptId);
    rules.push({ lhs, rhs: [] }); // empty rhs = ε
  }

  // 3. Deduplicate rules (same lhs and same rhs sequence)
  const seen = new Set<string>();
  const dedupedRules: CFGRule[] = [];
  for (const rule of rules) {
    const key = `${rule.lhs}→${rule.rhs.join(' ')}`;
    if (!seen.has(key)) {
      seen.add(key);
      dedupedRules.push(rule);
    }
  }

  // 4. Sort: start symbol first, then alphabetical by lhs, then by rhs length
  const startNT = stateToNT(nfa.start);
  dedupedRules.sort((a, b) => {
    if (a.lhs === startNT && b.lhs !== startNT) return -1;
    if (b.lhs === startNT && a.lhs !== startNT) return 1;
    if (a.lhs !== b.lhs) return a.lhs.localeCompare(b.lhs);
    return b.rhs.length - a.rhs.length; // longer rhs first (symbol transitions before ε)
  });

  return {
    startSymbol: startNT,
    rules: dedupedRules,
  };
}

// ─── Pretty-print helpers (used by UI) ───────────────────────────────────────

/** Format a single CFG rule as a readable string: "Q0 → a Q1" or "Q0 → ε" */
export function formatRule(rule: CFGRule): string {
  const rhs = rule.rhs.length === 0 ? 'ε' : rule.rhs.join(' ');
  return `${rule.lhs} → ${rhs}`;
}
