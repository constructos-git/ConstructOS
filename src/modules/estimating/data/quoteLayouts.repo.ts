import { supabase } from '@/lib/supabase';
import type { LayoutBlock } from '../designer/blocks';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const quoteLayoutsRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('quote_layouts')
      .select('*')
      .eq('company_id', cid)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getById(companyId: string | null | undefined, layoutId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('quote_layouts')
      .select('*')
      .eq('company_id', cid)
      .eq('id', layoutId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(companyId: string | null | undefined, layout: {
    name: string;
    brand_preset_id?: string;
    blocks: LayoutBlock[];
  }) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('quote_layouts')
      .insert({
        company_id: cid,
        ...layout,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async update(companyId: string | null | undefined, layoutId: string, patch: Partial<{
    name: string;
    brand_preset_id: string;
    blocks: LayoutBlock[];
  }>) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('quote_layouts')
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', cid)
      .eq('id', layoutId);
    if (error) throw error;
  },

  async remove(companyId: string | null | undefined, layoutId: string) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('quote_layouts')
      .delete()
      .eq('company_id', cid)
      .eq('id', layoutId);
    if (error) throw error;
  },
};

