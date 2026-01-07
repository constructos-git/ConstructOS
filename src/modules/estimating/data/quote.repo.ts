import { supabase } from '@/lib/supabase';
import { emptyDoc } from '../components/rich/tiptapHelpers';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const quoteRepo = {
  async getOrCreate(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_quotes')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .maybeSingle();
    if (error) {
      // Table might not exist yet or RLS issue - return null
      if (error.code === 'PGRST116' || error.code === '42P01' || error.code === 'PGRST205' || error.code === '42501') {
        return null;
      }
      throw error;
    }

    if (data) return data;

    const { data: created, error: cErr } = await supabase
      .from('estimate_quotes')
      .insert({
        company_id: cid,
        estimate_id: estimateId,
        intro_body: 'Thank you for the opportunity to provide a quotation. Please find our proposed scope and costs below.',
        terms_body:
          'This quotation is valid for 30 days. Any variations to scope/specification will be priced separately. Payment terms to be agreed prior to commencement.',
        intro_body_rich: emptyDoc,
        programme_notes_rich: emptyDoc,
        payment_notes_rich: emptyDoc,
        warranty_notes_rich: emptyDoc,
        terms_body_rich: emptyDoc,
        inclusions: JSON.stringify(['Site setup and protection', 'Materials and labour as described', 'Work carried out in accordance with Building Regulations where applicable']),
        exclusions: JSON.stringify(['Planning fees', 'Party wall surveyor fees', 'Asbestos removal (if discovered)']),
        assumptions: JSON.stringify(['Clear access to site', 'Normal working hours unless agreed', 'Customer to confirm finishes and selections before ordering']),
      })
      .select('*')
      .single();
    if (cErr) {
      // Handle RLS or duplicate key errors gracefully
      if (cErr.code === '42501' || cErr.code === '23505' || cErr.message?.includes('permission denied') || cErr.message?.includes('duplicate key')) {
        // Try to fetch existing record instead
        const { data: existing } = await supabase
          .from('estimate_quotes')
          .select('*')
          .eq('company_id', cid)
          .eq('estimate_id', estimateId)
          .maybeSingle();
        return existing || null;
      }
      throw cErr;
    }
    return created;
  },

  async update(companyId: string | null | undefined, estimateId: string, patch: any) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimate_quotes')
      .update(patch)
      .eq('company_id', cid)
      .eq('estimate_id', estimateId);
    if (error) throw error;
  },

  async applyTemplate(companyId: string | null | undefined, estimateId: string, template: any) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimate_quotes')
      .update({
        intro_title: template.intro_title,
        intro_body_rich: template.intro_body_rich,
        programme_notes_rich: template.programme_notes_rich,
        payment_notes_rich: template.payment_notes_rich,
        warranty_notes_rich: template.warranty_notes_rich,
        terms_body_rich: template.terms_body_rich,
        inclusions: template.inclusions,
        exclusions: template.exclusions,
        assumptions: template.assumptions,
        show_pricing_breakdown: template.show_pricing_breakdown,
        show_section_details: template.show_section_details,
        layout_style: template.layout_style,
        primary_color: template.primary_color,
        secondary_color: template.secondary_color,
        logo_url: template.logo_url,
        font_family: template.font_family,
        applied_template_id: template.id,
      })
      .eq('company_id', cid)
      .eq('estimate_id', estimateId);
    if (error) throw error;
  },
};

