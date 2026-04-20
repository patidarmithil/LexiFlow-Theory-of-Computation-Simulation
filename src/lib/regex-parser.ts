/**
 * regex-parser.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Converts a Regular Expression string into a postfix token array using the
 * Shunting-Yard algorithm.
 *
 * Supported operators:
 *   *   Kleene star   (unary postfix, highest precedence)
 *   +   One-or-more   (unary postfix)
 *   ?   Zero-or-one   (unary postfix)
 *   |   Alternation   (binary, lowest precedence)
 *   .   Concatenation (explicit internal operator, medium precedence)
 *   ()  Grouping
 *
 * The parser first inserts explicit '.' operators where concatenation is
 * implied, then runs the standard Shunting-Yard algorithm.
 */

// ─── Token types ─────────────────────────────────────────────────────────────

export type TokenKind = 'LITERAL' | 'UNARY_OP' | 'BINARY_OP' | 'LPAREN' | 'RPAREN';

export interface Token {
  kind: TokenKind;
  value: string;
}

// ─── Operator metadata ───────────────────────────────────────────────────────

const UNARY_OPS = new Set(['*', '+', '?']);

const PRECEDENCE: Record<string, number> = {
  '|': 1,
  '.': 2,
  '*': 3,
  '+': 3,
  '?': 3,
};

// ─── Step 1: Tokenize ────────────────────────────────────────────────────────

export function tokenize(regex: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < regex.length) {
    const ch = regex[i];

    if (ch === '(') {
      tokens.push({ kind: 'LPAREN', value: '(' });
    } else if (ch === ')') {
      tokens.push({ kind: 'RPAREN', value: ')' });
    } else if (UNARY_OPS.has(ch)) {
      tokens.push({ kind: 'UNARY_OP', value: ch });
    } else if (ch === '|') {
      tokens.push({ kind: 'BINARY_OP', value: '|' });
    } else if (ch === '\\' && i + 1 < regex.length) {
      // Escaped character: treat next char as literal
      i++;
      tokens.push({ kind: 'LITERAL', value: regex[i] });
    } else if (ch === '.') {
      // Explicit dot = any character literal? No — we use dot for concat internally.
      // Treat bare '.' in user input as a wildcard literal for now.
      tokens.push({ kind: 'LITERAL', value: '.' });
    } else {
      tokens.push({ kind: 'LITERAL', value: ch });
    }
    i++;
  }

  return tokens;
}

// ─── Step 2: Insert explicit concatenation '.' ───────────────────────────────

export function insertConcat(tokens: Token[]): Token[] {
  const result: Token[] = [];
  const CONCAT: Token = { kind: 'BINARY_OP', value: '.' };

  for (let i = 0; i < tokens.length; i++) {
    const cur = tokens[i];
    const next = tokens[i + 1];
    result.push(cur);

    if (!next) continue;

    // Insert '.' between cur and next if:
    // cur is: literal, unary op, or ')'
    // AND next is: literal or '('
    const curIsAtom =
      cur.kind === 'LITERAL' || cur.kind === 'UNARY_OP' || cur.kind === 'RPAREN';
    const nextIsAtom = next.kind === 'LITERAL' || next.kind === 'LPAREN';

    if (curIsAtom && nextIsAtom) {
      result.push(CONCAT);
    }
  }

  return result;
}

// ─── Step 3: Shunting-Yard → postfix ─────────────────────────────────────────

export function toPostfix(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const opStack: Token[] = [];

  for (const token of tokens) {
    if (token.kind === 'LITERAL') {
      output.push(token);
    } else if (token.kind === 'UNARY_OP' || token.kind === 'BINARY_OP') {
      const prec = PRECEDENCE[token.value] ?? 0;
      while (opStack.length > 0) {
        const top = opStack[opStack.length - 1];
        if (top.kind === 'LPAREN') break;
        const topPrec = PRECEDENCE[top.value] ?? 0;
        // Left-associative: pop if topPrec >= prec
        // Unary ops are right-associative, so use > for them
        if (
          (token.kind === 'BINARY_OP' && topPrec >= prec) ||
          (token.kind === 'UNARY_OP' && topPrec > prec)
        ) {
          output.push(opStack.pop()!);
        } else {
          break;
        }
      }
      opStack.push(token);
    } else if (token.kind === 'LPAREN') {
      opStack.push(token);
    } else if (token.kind === 'RPAREN') {
      while (opStack.length > 0 && opStack[opStack.length - 1].kind !== 'LPAREN') {
        output.push(opStack.pop()!);
      }
      if (opStack.length === 0) {
        throw new Error('Mismatched parentheses: unexpected )');
      }
      opStack.pop(); // discard '('
    }
  }

  while (opStack.length > 0) {
    const top = opStack.pop()!;
    if (top.kind === 'LPAREN') {
      throw new Error('Mismatched parentheses: unclosed (');
    }
    output.push(top);
  }

  return output;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Parse a regex string into a postfix token array. */
export function parseRegex(regex: string): Token[] {
  if (!regex.trim()) throw new Error('Regular expression cannot be empty.');
  const tokens = tokenize(regex);
  const withConcat = insertConcat(tokens);
  return toPostfix(withConcat);
}
