import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const calculatorsRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_calculators')
      .select('*')
      .eq('company_id', cid)
      .eq('is_active', true)
      .order('category', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(companyId: string | null | undefined, payload: any) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_calculators')
      .insert({ company_id: cid, ...payload })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
};

