export type PricingMode = 'cost_plus' | 'price_only';
export type RoundingMode = 'none' | 'nearest_1' | 'nearest_5' | 'nearest_10';

export type PricingSettings = {
  vatRate: number;
  labourBurdenPct: number;
  overheadPct: number;
  marginPct: number;
  roundingMode: RoundingMode;
  pricingMode: PricingMode;
  wastageDefaults: Record<string, number>; // category -> pct
};

export type LineInput = {
  itemType: 'labour' | 'material' | 'plant' | 'subcontract';
  category?: string;
  quantity: number;
  unitCost: number;
  fixedPriceExVat?: number | null; // if set, price is fixed
  markupPctOverride?: number | null;
  wastagePctOverride?: number | null;
};

export type LineBreakdown = {
  baseCost: number;
  wastageCost: number;
  labourBurdenCost: number;
  overheadCost: number;
  marginCost: number;
  priceExVat: number;
  vat: number;
  totalIncVat: number;
};

