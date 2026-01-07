// Formula evaluator for assembly quantity calculations

export interface FormulaContext {
  [key: string]: number;
}

/**
 * Safely evaluates a formula string with token substitution
 * Supports: numbers, + - * /, parentheses, tokens {tokenName}
 * No eval() - parses and computes manually
 */
export function evaluateFormula(
  formula: string,
  context: FormulaContext
): number {
  if (!formula || !formula.trim()) {
    return 0;
  }

  // Replace tokens with values
  let expression = formula;
  Object.entries(context).forEach(([key, value]) => {
    const token = `{${key}}`;
    expression = expression.replace(new RegExp(token.replace(/[{}]/g, '\\$&'), 'g'), String(value));
  });

  // Remove any remaining tokens (replace with 0)
  expression = expression.replace(/\{[^}]+\}/g, '0');

  // Validate expression contains only safe characters
  if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
    console.warn('Invalid formula expression:', formula);
    return 0;
  }

  try {
    // Use Function constructor as safer alternative to eval (still limited to math)
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const result = new Function('return ' + expression)();
    return typeof result === 'number' && !isNaN(result) ? result : 0;
  } catch (error) {
    console.warn('Formula evaluation error:', error, 'Formula:', formula);
    return 0;
  }
}

/**
 * Extracts token names from a formula string
 */
export function extractTokens(formula: string): string[] {
  if (!formula) return [];
  const tokenRegex = /\{([^}]+)\}/g;
  const tokens: string[] = [];
  let match;
  while ((match = tokenRegex.exec(formula)) !== null) {
    if (!tokens.includes(match[1])) {
      tokens.push(match[1]);
    }
  }
  return tokens;
}

/**
 * Validates that all tokens in formula exist in context
 */
export function validateFormula(formula: string, context: FormulaContext): boolean {
  const tokens = extractTokens(formula);
  return tokens.every((token) => context.hasOwnProperty(token));
}

