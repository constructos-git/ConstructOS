import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const brandPresetsRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('brand_presets')
      .select('*')
      .eq('company_id', cid)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getById(companyId: string | null | undefined, presetId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('brand_presets')
      .select('*')
      .eq('company_id', cid)
      .eq('id', presetId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(companyId: string | null | undefined, preset: {
    name: string;
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
    header_html?: string;
    footer_html?: string;
  }) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('brand_presets')
      .insert({
        company_id: cid,
        ...preset,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async update(companyId: string | null | undefined, presetId: string, patch: Partial<{
    name: string;
    logo_url: string;
    primary_color: string;
    secondary_color: string;
    font_family: string;
    header_html: string;
    footer_html: string;
  }>) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('brand_presets')
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', cid)
      .eq('id', presetId);
    if (error) throw error;
  },

  async remove(companyId: string | null | undefined, presetId: string) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('brand_presets')
      .delete()
      .eq('company_id', cid)
      .eq('id', presetId);
    if (error) throw error;
  },
};

