// Rate settings utilities for Estimate Builder AI

export type Region =
  | 'London'
  | 'South East'
  | 'South West'
  | 'Midlands'
  | 'North'
  | 'Scotland'
  | 'Wales'
  | 'Northern Ireland';

export const DEFAULT_REGION_MULTIPLIERS: Record<Region, number> = {
  London: 1.25,
  'South East': 1.15,
  'South West': 1.10,
  Midlands: 1.0,
  North: 0.95,
  Scotland: 0.95,
  Wales: 0.95,
  'Northern Ireland': 0.95,
};

export interface RateSettings {
  region: Region;
  regionalMultiplier: number;
  overheadPct: number;
  marginPct: number;
  contingencyPct: number;
  vatPct: number;
  autoRateMode: boolean;
}

export function getDefaultRateSettings(region: Region = 'South East'): RateSettings {
  return {
    region,
    regionalMultiplier: DEFAULT_REGION_MULTIPLIERS[region],
    overheadPct: 10.0,
    marginPct: 15.0,
    contingencyPct: 5.0,
    vatPct: 20.0,
    autoRateMode: true,
  };
}

// Baseline rates for UK domestic construction (per unit)
export const BASELINE_RATES: Record<string, number> = {
  // Labour rates (per hour)
  'labour.general': 25.0,
  'labour.skilled': 35.0,
  'labour.specialist': 45.0,

  // Material rates (per unit)
  'material.concrete.m3': 120.0,
  'material.blocks.m2': 25.0,
  'material.bricks.m2': 45.0,
  'material.insulation.m2': 12.0,
  'material.roofing.felt.m2': 15.0,
  'material.roofing.grp.m2': 25.0,
  'material.roofing.epdm.m2': 35.0,
  'material.roofing.slate.m2': 45.0,
  'material.roofing.tile.m2': 35.0,
  'material.plasterboard.m2': 8.0,
  'material.windows.no': 350.0,
  'material.doors.no': 450.0,

  // Subcontract rates
  'subcontract.electrics.m2': 45.0,
  'subcontract.plumbing.m2': 50.0,
  'subcontract.heating.m2': 60.0,
};

export function getBaselineRate(key: string): number {
  return BASELINE_RATES[key] || 0;
}

export function applyRegionalMultiplier(baseRate: number, multiplier: number): number {
  return baseRate * multiplier;
}

