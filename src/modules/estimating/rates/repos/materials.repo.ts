import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const materialsRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('rate_materials')
      .select('*')
      .eq('company_id', cid)
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async search(companyId: string | null | undefined, query: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('rate_materials')
      .select('*')
      .eq('company_id', cid)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,code.ilike.%${query}%,category.ilike.%${query}%`)
      .order('name', { ascending: true })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  },

  async create(companyId: string | null | undefined, payload: {
    code?: string;
    name: string;
    category?: string;
    unit: string;
    base_cost: number;
    supplier_hint?: string;
    tags?: string;
  }) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('rate_materials')
      .insert({
        company_id: cid,
        ...payload,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async update(companyId: string | null | undefined, id: string, patch: Partial<{
    code: string;
    name: string;
    category: string;
    unit: string;
    base_cost: number;
    supplier_hint: string;
    tags: string;
    is_active: boolean;
  }>) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('rate_materials')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('company_id', cid)
      .eq('id', id);
    if (error) throw error;
  },
};

