import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const pdfThemesRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('pdf_themes')
      .select('*')
      .eq('company_id', cid)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getById(companyId: string | null | undefined, themeId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('pdf_themes')
      .select('*')
      .eq('company_id', cid)
      .eq('id', themeId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(companyId: string | null | undefined, theme: {
    name: string;
    header_template?: any;
    footer_template?: any;
    styles?: any;
    watermark?: any;
  }) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('pdf_themes')
      .insert({
        company_id: cid,
        ...theme,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async update(companyId: string | null | undefined, themeId: string, patch: Partial<{
    name: string;
    header_template: any;
    footer_template: any;
    styles: any;
    watermark: any;
  }>) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('pdf_themes')
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', cid)
      .eq('id', themeId);
    if (error) throw error;
  },

  async remove(companyId: string | null | undefined, themeId: string) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('pdf_themes')
      .delete()
      .eq('company_id', cid)
      .eq('id', themeId);
    if (error) throw error;
  },
};

