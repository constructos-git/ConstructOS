import type { EstimateItemType } from './estimating.schemas';

export function round2(n: number): number {
  return Number((Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2));
}

export function computeLine(quantity: number, unitCost: number, unitPrice: number) {
  const q = Number.isFinite(quantity) ? quantity : 0;
  return {
    line_cost: round2(q * (Number.isFinite(unitCost) ? unitCost : 0)),
    line_total: round2(q * (Number.isFinite(unitPrice) ? unitPrice : 0)),
  };
}

/**
 * If marginPercent > 0 and unitCost > 0, derive unitPrice:
 * unitPrice = unitCost * (1 + margin/100)
 */
export function deriveUnitPrice(unitCost: number, marginPercent: number): number {
  const c = Number.isFinite(unitCost) ? unitCost : 0;
  const m = Number.isFinite(marginPercent) ? marginPercent : 0;
  if (c <= 0 || m <= 0) return 0;
  return round2(c * (1 + m / 100));
}

/**
 * VERY SMALL expression evaluator for assembly quantity_expr.
 * Supported: numbers, variables, + - * / ( ) and whitespace.
 * Example expr: "area", "length*height-openingsArea"
 * This is intentionally constrained to avoid arbitrary code execution.
 */
export function evalQuantityExpr(expr: string, vars: Record<string, number>): number {
  const safe = (expr || '0')
    .replace(/[^0-9a-zA-Z_+\-*/().\s]/g, '') // strip anything unsafe
    .trim();

  if (!safe) return 0;

  // Replace variable tokens with numeric values
  const replaced = safe.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (token) => {
    const v = vars[token];
    return Number.isFinite(v) ? String(v) : '0';
  });

  // Final safety gate: allow only digits/operators/space/paren/dot
  if (!/^[0-9+\-*/().\s]+$/.test(replaced)) return 0;

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${replaced});`);
    const out = Number(fn());
    return Number.isFinite(out) ? out : 0;
  } catch {
    return 0;
  }
}

