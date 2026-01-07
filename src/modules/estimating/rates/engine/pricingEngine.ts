import { priceLine } from './breakdown';
import { PricingSettings, LineInput, LineBreakdown } from './types';

export function computeEstimateTotals(settings: PricingSettings, lines: LineInput[]): {
  breakdowns: LineBreakdown[];
  subtotalExVat: number;
  vat: number;
  total: number;
} {
  const breakdowns = lines.map((l) => priceLine(settings, l));
  const subtotalExVat = breakdowns.reduce((a, b) => a + b.priceExVat, 0);
  const vat = breakdowns.reduce((a, b) => a + b.vat, 0);
  const total = subtotalExVat + vat;
  return { breakdowns, subtotalExVat, vat, total };
}

