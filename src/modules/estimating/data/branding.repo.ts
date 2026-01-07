import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const brandingRepo = {
  async getOrCreate(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('company_quote_branding')
      .select('*')
      .eq('company_id', cid)
      .maybeSingle();
    if (error) {
      // Table might not exist yet or RLS issue - return null
      if (error.code === 'PGRST116' || error.code === '42P01' || error.code === 'PGRST205' || error.code === '42501') {
        return null;
      }
      throw error;
    }

    if (data) return data;

    const { data: created, error: cErr } = await supabase
      .from('company_quote_branding')
      .insert({ company_id: cid })
      .select('*')
      .single();
    if (cErr) {
      // Handle RLS or duplicate key errors gracefully
      if (cErr.code === '42501' || cErr.code === '23505' || cErr.message?.includes('permission denied') || cErr.message?.includes('duplicate key')) {
        // Try to fetch existing record instead
        const { data: existing } = await supabase
          .from('company_quote_branding')
          .select('*')
          .eq('company_id', cid)
          .maybeSingle();
        return existing || null;
      }
      throw cErr;
    }
    return created;
  },

  async update(companyId: string | null | undefined, patch: any) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('company_quote_branding')
      .update(patch)
      .eq('company_id', cid);
    if (error) throw error;
  },
};

