/**
 * Safe expression evaluator (no eval)
 * Implements shunting-yard algorithm for infix to RPN conversion
 * Then evaluates RPN stack
 */

type Token = { type: 'number' | 'variable' | 'operator' | 'paren'; value: string | number };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const isDigit = (c: string) => /[0-9.]/.test(c);
  const isLetter = (c: string) => /[a-zA-Z_]/.test(c);
  const isOperator = (c: string) => /[+\-*/]/.test(c);

  while (i < expr.length) {
    const c = expr[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }

    if (c === '(' || c === ')') {
      tokens.push({ type: 'paren', value: c });
      i++;
    } else if (isOperator(c)) {
      tokens.push({ type: 'operator', value: c });
      i++;
    } else if (isDigit(c)) {
      let num = '';
      while (i < expr.length && (isDigit(expr[i]) || expr[i] === '.')) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
    } else if (isLetter(c)) {
      let name = '';
      while (i < expr.length && (isLetter(expr[i]) || isDigit(expr[i]) || expr[i] === '_')) {
        name += expr[i];
        i++;
      }
      tokens.push({ type: 'variable', value: name });
    } else {
      throw new Error(`Unexpected character: ${c}`);
    }
  }

  return tokens;
}

function precedence(op: string): number {
  if (op === '+' || op === '-') return 1;
  if (op === '*' || op === '/') return 2;
  return 0;
}

function shuntingYard(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const operators: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'number' || token.type === 'variable') {
      output.push(token);
    } else if (token.type === 'operator') {
      while (
        operators.length > 0 &&
        operators[operators.length - 1].type === 'operator' &&
        operators[operators.length - 1].value !== '(' &&
        precedence(operators[operators.length - 1].value as string) >= precedence(token.value as string)
      ) {
        output.push(operators.pop()!);
      }
      operators.push(token);
    } else if (token.value === '(') {
      operators.push(token);
    } else if (token.value === ')') {
      while (operators.length > 0 && operators[operators.length - 1].value !== '(') {
        output.push(operators.pop()!);
      }
      if (operators.length === 0) throw new Error('Mismatched parentheses');
      operators.pop(); // remove '('
    }
  }

  while (operators.length > 0) {
    const op = operators.pop()!;
    if (op.value === '(' || op.value === ')') throw new Error('Mismatched parentheses');
    output.push(op);
  }

  return output;
}

function evaluateRPN(rpn: Token[], vars: Record<string, number>): number {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === 'number') {
      stack.push(token.value as number);
    } else if (token.type === 'variable') {
      const varName = token.value as string;
      if (!(varName in vars)) {
        throw new Error(`Unknown variable: ${varName}`);
      }
      stack.push(vars[varName]);
    } else if (token.type === 'operator') {
      if (stack.length < 2) throw new Error('Invalid expression');
      const b = stack.pop()!;
      const a = stack.pop()!;
      const op = token.value as string;
      if (op === '+') stack.push(a + b);
      else if (op === '-') stack.push(a - b);
      else if (op === '*') stack.push(a * b);
      else if (op === '/') {
        if (b === 0) throw new Error('Division by zero');
        stack.push(a / b);
      }
    }
  }

  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
}

/**
 * Evaluate a mathematical expression safely (no eval)
 * @param expr Expression string (e.g., "area_m2 * 0.9 + 2")
 * @param vars Variable values (e.g., { area_m2: 10 })
 * @returns Evaluated result
 */
export function evalExpression(expr: string, vars: Record<string, number>): number {
  if (!expr || !expr.trim()) return 0;
  
  try {
    const tokens = tokenize(expr.trim());
    const rpn = shuntingYard(tokens);
    const result = evaluateRPN(rpn, vars);
    // Clamp negative to 0 for quantities
    return Math.max(0, result);
  } catch (error) {
    throw new Error(`Expression evaluation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

