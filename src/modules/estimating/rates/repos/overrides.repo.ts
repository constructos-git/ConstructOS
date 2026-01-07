import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const overridesRepo = {
  async getOrCreate(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data: existing, error: eErr } = await supabase
      .from('estimate_pricing_overrides')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .maybeSingle();
    if (eErr) {
      // Table might not exist yet - return null (no overrides)
      if (eErr.code === 'PGRST116' || eErr.code === '42P01' || eErr.code === 'PGRST205') {
        return null;
      }
      throw eErr;
    }
    if (existing) return existing;

    const { data: created, error: cErr } = await supabase
      .from('estimate_pricing_overrides')
      .insert({
        company_id: cid,
        estimate_id: estimateId,
      })
      .select('*')
      .single();
    if (cErr) {
      // Handle table missing, RLS, or duplicate key errors gracefully
      if (cErr.code === 'PGRST116' || cErr.code === '42P01' || cErr.code === 'PGRST205') {
        console.warn('estimate_pricing_overrides table does not exist. Please run migrations.');
        return null;
      }
      // 409 Conflict = duplicate key, try to fetch existing
      if (cErr.code === '23505' || cErr.message?.includes('duplicate key') || cErr.message?.includes('409')) {
        const { data: existing } = await supabase
          .from('estimate_pricing_overrides')
          .select('*')
          .eq('company_id', cid)
          .eq('estimate_id', estimateId)
          .maybeSingle();
        return existing || null;
      }
      throw cErr;
    }
    return created;
  },

  async update(companyId: string | null | undefined, estimateId: string, patch: Partial<{
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
      .from('estimate_pricing_overrides')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('company_id', cid)
      .eq('estimate_id', estimateId);
    if (error) throw error;
  },
};

