import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const estimateSectionsRepo = {
  async list(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_sections')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(companyId: string | null | undefined, estimateId: string, title: string, sortOrder: number, parentSectionId: string | null = null) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_sections')
      .insert({
        company_id: cid,
        estimate_id: estimateId,
        title,
        sort_order: sortOrder,
        parent_section_id: parentSectionId,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async rename(companyId: string | null | undefined, sectionId: string, title: string) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimate_sections')
      .update({ title })
      .eq('company_id', cid)
      .eq('id', sectionId);
    if (error) throw error;
  },

  async remove(companyId: string | null | undefined, sectionId: string) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimate_sections')
      .delete()
      .eq('company_id', cid)
      .eq('id', sectionId);
    if (error) throw error;
  },

  async updateNarrative(companyId: string | null | undefined, sectionId: string, narrativeRich: any) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimate_sections')
      .update({ client_narrative_rich: narrativeRich })
      .eq('company_id', cid)
      .eq('id', sectionId);
    if (error) throw error;
  },

  async update(companyId: string | null | undefined, sectionId: string, patch: any) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimate_sections')
      .update(patch)
      .eq('company_id', cid)
      .eq('id', sectionId);
    if (error) throw error;
  },
};

