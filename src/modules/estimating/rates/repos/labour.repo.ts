import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const labourRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('rate_labour')
      .select('*')
      .eq('company_id', cid)
      .eq('is_active', true)
      .order('trade', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async search(companyId: string | null | undefined, query: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('rate_labour')
      .select('*')
      .eq('company_id', cid)
      .eq('is_active', true)
      .or(`trade.ilike.%${query}%,role.ilike.%${query}%`)
      .order('trade', { ascending: true })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  },

  async create(companyId: string | null | undefined, payload: {
    trade: string;
    role?: string;
    unit: string;
    base_cost: number;
    productivity_hint?: string;
    tags?: string;
  }) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('rate_labour')
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
    trade: string;
    role: string;
    unit: string;
    base_cost: number;
    productivity_hint: string;
    tags: string;
    is_active: boolean;
  }>) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('rate_labour')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('company_id', cid)
      .eq('id', id);
    if (error) throw error;
  },
};

