import { regionsRepo } from '../repos/regions.repo';
import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

const UK_REGIONS = [
  'London',
  'South East',
  'South West',
  'Midlands',
  'North',
  'Scotland',
  'Wales',
  'Northern Ireland',
];

const TRADES = [
  { trade: 'Carpenter', rateHour: 25, rateDay: 200 },
  { trade: 'Electrician', rateHour: 30, rateDay: 240 },
  { trade: 'Plumber', rateHour: 28, rateDay: 224 },
  { trade: 'Labourer', rateHour: 15, rateDay: 120 },
  { trade: 'Bricklayer', rateHour: 22, rateDay: 176 },
  { trade: 'Plasterer', rateHour: 24, rateDay: 192 },
  { trade: 'Roofer', rateHour: 26, rateDay: 208 },
  { trade: 'Painter', rateHour: 18, rateDay: 144 },
];

export async function seedRegionsAndTrades(companyId: string | null | undefined) {
  const cid = getCompanyId(companyId);
  
  // Check if regions already exist
  const existing = await regionsRepo.list(cid);
  if (existing.length > 0) return; // Already seeded

  // Create regions
  const regionIds: Record<string, string> = {};
  for (const name of UK_REGIONS) {
    const region = await regionsRepo.create(cid, name);
    regionIds[name] = region.id;
  }

  // Set South East as default
  if (regionIds['South East']) {
    await regionsRepo.setDefault(cid, regionIds['South East']);
  }

  // Create trade rates for each region
  for (const regionName of UK_REGIONS) {
    const regionId = regionIds[regionName];
    if (!regionId) continue;

    for (const trade of TRADES) {
      await supabase.from('trade_rates').insert({
        company_id: cid,
        region_id: regionId,
        trade: trade.trade,
        rate_hour: trade.rateHour,
        rate_day: trade.rateDay,
      });
    }
  }
}

