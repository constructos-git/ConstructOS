import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const settingsRepo = {
  async getOrCreate(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data: existing, error: eErr } = await supabase
      .from('company_estimating_settings')
      .select('*')
      .eq('company_id', cid)
      .maybeSingle();
    if (eErr) {
      // Table might not exist yet - return defaults
      if (eErr.code === 'PGRST116' || eErr.code === '42P01' || eErr.code === 'PGRST205') {
        return {
          id: '',
          company_id: cid,
          vat_rate: 20,
          labour_burden_pct: 0,
          overhead_pct: 0,
          margin_pct: 0,
          rounding_mode: 'none',
          pricing_mode: 'cost_plus',
          wastage_defaults: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any;
      }
      throw eErr;
    }
    if (existing) return existing;

    const { data: created, error: cErr } = await supabase
      .from('company_estimating_settings')
      .insert({
        company_id: cid,
        vat_rate: 20,
        labour_burden_pct: 0,
        overhead_pct: 0,
        margin_pct: 0,
        rounding_mode: 'none',
        pricing_mode: 'cost_plus',
        wastage_defaults: {},
      })
      .select('*')
      .single();
    if (cErr) {
      // Table might not exist yet
      if (cErr.code === 'PGRST116' || cErr.code === '42P01' || cErr.code === 'PGRST205') {
        console.warn('company_estimating_settings table does not exist. Please run migrations.');
        return null;
      }
      throw cErr;
    }
    return created;
  },

  async update(companyId: string | null | undefined, patch: Partial<{
    vat_rate: number;
    labour_burden_pct: number;
    overhead_pct: number;
    margin_pct: number;
    rounding_mode: string;
    pricing_mode: string;
    wastage_defaults: Record<string, number>;
  }>) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('company_estimating_settings')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('company_id', cid);
    if (error) throw error;
  },
};

