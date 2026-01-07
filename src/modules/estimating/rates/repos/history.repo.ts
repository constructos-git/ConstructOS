import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const historyRepo = {
  async write(companyId: string | null | undefined, providerKey: string, quotes: Array<{
    code?: string;
    name: string;
    unit: string;
    cost: number;
    currency?: string;
  }>) {
    const cid = getCompanyId(companyId);
    const rows = quotes.map((q) => ({
      company_id: cid,
      provider_key: providerKey,
      material_code: q.code || null,
      material_name: q.name,
      unit: q.unit,
      cost: q.cost,
      currency: q.currency || 'GBP',
      observed_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('rate_price_history')
      .insert(rows);
    if (error) throw error;
  },

  async getHistory(companyId: string | null | undefined, materialName: string, providerKey?: string, days = 30) {
    const cid = getCompanyId(companyId);
    const since = new Date();
    since.setDate(since.getDate() - days);

    let query = supabase
      .from('rate_price_history')
      .select('*')
      .eq('company_id', cid)
      .ilike('material_name', materialName)
      .gte('observed_at', since.toISOString())
      .order('observed_at', { ascending: true });

    if (providerKey) {
      query = query.eq('provider_key', providerKey);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },
};

