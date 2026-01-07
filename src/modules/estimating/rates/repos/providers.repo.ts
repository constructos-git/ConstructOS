import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const providersRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('rate_providers')
      .select('*')
      .eq('company_id', cid)
      .order('provider_key', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async getOrCreate(companyId: string | null | undefined, providerKey: string, defaults: { is_enabled?: boolean; settings?: any }) {
    const cid = getCompanyId(companyId);
    const { data: existing, error: eErr } = await supabase
      .from('rate_providers')
      .select('*')
      .eq('company_id', cid)
      .eq('provider_key', providerKey)
      .maybeSingle();
    if (eErr) throw eErr;
    if (existing) return existing;

    const { data: created, error: cErr } = await supabase
      .from('rate_providers')
      .insert({
        company_id: cid,
        provider_key: providerKey,
        is_enabled: defaults.is_enabled ?? false,
        settings: defaults.settings ?? {},
      })
      .select('*')
      .single();
    if (cErr) throw cErr;
    return created;
  },

  async toggle(companyId: string | null | undefined, providerKey: string, enabled: boolean) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('rate_providers')
      .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
      .eq('company_id', cid)
      .eq('provider_key', providerKey);
    if (error) throw error;
  },
};

