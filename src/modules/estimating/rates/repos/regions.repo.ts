import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const regionsRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('rate_regions')
      .select('*')
      .eq('company_id', cid)
      .order('is_default', { ascending: false })
      .order('name', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(companyId: string | null | undefined, name: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('rate_regions')
      .insert({
        company_id: cid,
        name,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async setDefault(companyId: string | null | undefined, regionId: string) {
    const cid = getCompanyId(companyId);
    // Unset all defaults first
    await supabase
      .from('rate_regions')
      .update({ is_default: false })
      .eq('company_id', cid);
    // Set new default
    const { error } = await supabase
      .from('rate_regions')
      .update({ is_default: true })
      .eq('company_id', cid)
      .eq('id', regionId);
    if (error) throw error;
  },
};

