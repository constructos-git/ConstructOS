import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { regionsRepo } from '../../rates/repos/regions.repo';
import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export function RegionsTab({ companyId }: { companyId: string }) {
  const cid = getCompanyId(companyId);
  const [regions, setRegions] = useState<any[]>([]);
  const [tradeRates, setTradeRates] = useState<Record<string, any[]>>({});

  useEffect(() => {
    loadRegions();
  }, [companyId]);

  async function loadRegions() {
    try {
      const data = await regionsRepo.list(cid);
      setRegions(data);
      // Load trade rates for each region
      const rates: Record<string, any[]> = {};
      for (const region of data) {
        const { data: trades } = await supabase
          .from('trade_rates')
          .select('*')
          .eq('company_id', cid)
          .eq('region_id', region.id)
          .order('trade', { ascending: true });
        rates[region.id] = trades ?? [];
      }
      setTradeRates(rates);
    } catch (error) {
      console.error('Failed to load regions:', error);
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="text-sm font-semibold">Regions & Trade Rates</div>

      <div className="space-y-4">
        {regions.map((region) => (
          <div key={region.id} className="rounded border p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{region.name}{region.is_default ? ' (Default)' : ''}</div>
              {!region.is_default && (
                <button
                  className="text-xs text-blue-600"
                  onClick={async () => {
                    await regionsRepo.setDefault(cid, region.id);
                    await loadRegions();
                  }}
                  type="button"
                >
                  Set as default
                </button>
              )}
            </div>
            <div className="space-y-1 text-xs">
              {(tradeRates[region.id] || []).map((tr) => (
                <div key={tr.id} className="text-slate-600">
                  {tr.trade}: £{Number(tr.rate_hour).toFixed(2)}/hr, £{Number(tr.rate_day).toFixed(2)}/day
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

