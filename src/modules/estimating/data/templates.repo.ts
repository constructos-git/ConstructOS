import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const estimateTemplatesRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_templates')
      .select('*')
      .eq('company_id', cid)
      .order('category', { ascending: true });
    if (error) {
      console.error('❌ Error listing templates:', error);
      // If table doesn't exist, return empty array instead of throwing
      if (error.code === 'PGRST116' || error.code === '42P01' || error.code === 'PGRST205') {
        console.warn('⚠️  estimate_templates table does not exist. Please run migrations.');
        return [];
      }
      throw error;
    }
    return data ?? [];
  },

  async getWithSectionsAndItems(companyId: string | null | undefined, templateId: string) {
    const cid = getCompanyId(companyId);
    const { data: template, error: tErr } = await supabase
      .from('estimate_templates')
      .select('*')
      .eq('company_id', cid)
      .eq('id', templateId)
      .single();
    if (tErr) throw tErr;

    const { data: sections, error: sErr } = await supabase
      .from('estimate_template_sections')
      .select('*')
      .eq('company_id', cid)
      .eq('template_id', templateId)
      .order('sort_order', { ascending: true });
    if (sErr) throw sErr;

    const { data: items, error: iErr } = await supabase
      .from('estimate_template_items')
      .select('*')
      .eq('company_id', cid)
      .eq('template_id', templateId)
      .order('template_section_sort_order', { ascending: true })
      .order('sort_order', { ascending: true });
    if (iErr) throw iErr;

    return {
      template,
      sections: sections ?? [],
      items: items ?? [],
    };
  },

  async create(companyId: string | null | undefined, payload: { name: string; description?: string; category?: string }) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_templates')
      .insert({
        company_id: cid,
        name: payload.name,
        description: payload.description ?? null,
        category: payload.category ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async update(companyId: string | null | undefined, templateId: string, patch: any) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimate_templates')
      .update(patch)
      .eq('company_id', cid)
      .eq('id', templateId);
    if (error) throw error;
  },

  async createSection(companyId: string | null | undefined, templateId: string, payload: { sort_order: number; title: string; is_client_visible?: boolean }) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_template_sections')
      .insert({
        company_id: cid,
        template_id: templateId,
        sort_order: payload.sort_order,
        title: payload.title,
        is_client_visible: payload.is_client_visible ?? true,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async createItem(companyId: string | null | undefined, templateId: string, payload: {
    template_section_sort_order: number;
    sort_order: number;
    item_type: string;
    title: string;
    description?: string;
    quantity: number;
    unit: string;
    unit_price: number;
    is_client_visible?: boolean;
  }) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_template_items')
      .insert({
        company_id: cid,
        template_id: templateId,
        template_section_sort_order: payload.template_section_sort_order,
        sort_order: payload.sort_order,
        item_type: payload.item_type,
        title: payload.title,
        description: payload.description ?? null,
        quantity: payload.quantity,
        unit: payload.unit,
        unit_price: payload.unit_price,
        is_client_visible: payload.is_client_visible ?? true,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async applyToEstimate(companyId: string | null | undefined, estimateId: string, templateId: string) {
    const cid = getCompanyId(companyId);
    const { template, sections, items } = await this.getWithSectionsAndItems(cid, templateId);

    // Create sections
    const sectionMap: Record<number, string> = {};
    for (const s of sections) {
      const { data: created, error } = await supabase
        .from('estimate_sections')
        .insert({
          company_id: cid,
          estimate_id: estimateId,
          sort_order: s.sort_order,
          title: s.title,
          is_client_visible: s.is_client_visible,
        })
        .select('id')
        .single();
      if (error) throw error;
      sectionMap[s.sort_order] = created.id;
    }

    // Create items
    const inserts = items.map((it: any) => {
      const sectionId = sectionMap[it.template_section_sort_order] ?? null;
      return {
        company_id: cid,
        estimate_id: estimateId,
        section_id: sectionId,
        sort_order: it.sort_order,
        item_type: it.item_type,
        title: it.title,
        description: it.description ?? null,
        quantity: it.quantity,
        unit: it.unit,
        unit_cost: 0,
        unit_price: it.unit_price,
        margin_percent: 0,
        line_cost: 0,
        line_total: Number(it.quantity) * Number(it.unit_price),
        is_client_visible: it.is_client_visible,
      };
    });

    if (inserts.length) {
      const { error } = await supabase.from('estimate_items').insert(inserts);
      if (error) throw error;
    }

    return { sectionsCreated: sections.length, itemsCreated: items.length };
  },
};
