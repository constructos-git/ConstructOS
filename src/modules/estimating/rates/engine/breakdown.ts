import { LineBreakdown, PricingSettings, LineInput } from './types';

function roundBy(mode: PricingSettings['roundingMode'], value: number): number {
  if (mode === 'none') return value;
  const step = mode === 'nearest_1' ? 1 : mode === 'nearest_5' ? 5 : 10;
  return Math.round(value / step) * step;
}

export function priceLine(settings: PricingSettings, line: LineInput): LineBreakdown {
  const qty = Number(line.quantity || 0);
  const unitCost = Number(line.unitCost || 0);

  const baseCost = qty * unitCost;

  const wastagePct =
    line.wastagePctOverride ?? settings.wastageDefaults[line.category || ''] ?? 0;

  const wastageCost = baseCost * (Number(wastagePct) / 100);

  const costBeforeBurden = baseCost + wastageCost;

  const labourBurdenCost =
    (line.itemType === 'labour' ? costBeforeBurden * (settings.labourBurdenPct / 100) : 0);

  const costAfterBurden = costBeforeBurden + labourBurdenCost;

  const overheadCost = costAfterBurden * (settings.overheadPct / 100);

  const costAfterOverhead = costAfterBurden + overheadCost;

  // price ex vat
  let priceExVat: number;

  if (settings.pricingMode === 'price_only' && line.fixedPriceExVat != null) {
    priceExVat = Number(line.fixedPriceExVat);
  } else if (line.fixedPriceExVat != null) {
    priceExVat = Number(line.fixedPriceExVat);
  } else {
    const marginPct = (line.markupPctOverride ?? settings.marginPct) / 100;
    const marginCost = costAfterOverhead * marginPct;
    priceExVat = costAfterOverhead + marginCost;
  }

  priceExVat = roundBy(settings.roundingMode, priceExVat);

  const vat = priceExVat * (settings.vatRate / 100);
  const totalIncVat = priceExVat + vat;

  const marginCost =
    line.fixedPriceExVat != null
      ? Math.max(0, priceExVat - costAfterOverhead)
      : costAfterOverhead * ((line.markupPctOverride ?? settings.marginPct) / 100);

  return {
    baseCost,
    wastageCost,
    labourBurdenCost,
    overheadCost,
    marginCost,
    priceExVat,
    vat,
    totalIncVat,
  };
}

