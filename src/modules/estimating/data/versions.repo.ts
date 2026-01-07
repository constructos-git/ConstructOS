import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const versionsRepo = {
  async list(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('quote_versions')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .order('version_number', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async createRevision(companyId: string | null | undefined, estimateId: string, payload: { label?: string }) {
    const cid = getCompanyId(companyId);
    // Fetch current estimate + quote + client-visible sections/items
    const { data: est, error: estErr } = await supabase
      .from('estimates')
      .select('*')
      .eq('company_id', cid)
      .eq('id', estimateId)
      .single();
    if (estErr) throw estErr;

    const { data: quote, error: qErr } = await supabase
      .from('estimate_quotes')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .maybeSingle();
    if (qErr) throw qErr;

    const { data: sections, error: sErr } = await supabase
      .from('estimate_sections')
      .select('*')
      .eq('estimate_id', estimateId)
      .eq('is_client_visible', true)
      .order('sort_order', { ascending: true });
    if (sErr) throw sErr;

    const { data: items, error: iErr } = await supabase
      .from('estimate_items')
      .select('*')
      .eq('estimate_id', estimateId)
      .eq('is_client_visible', true)
      .order('sort_order', { ascending: true });
    if (iErr) throw iErr;

    // Determine next version
    const { data: latest, error: lErr } = await supabase
      .from('quote_versions')
      .select('version_number')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .order('version_number', { ascending: false })
      .limit(1);
    if (lErr) throw lErr;
    const nextVer = (latest?.[0]?.version_number ?? 0) + 1;

    const branding = {
      logo_url: quote?.logo_url ?? null,
      primary_color: quote?.primary_color ?? null,
      secondary_color: quote?.secondary_color ?? null,
      font_family: quote?.font_family ?? null,
      layout_style: quote?.layout_style ?? null,
    };

    const { data: created, error: cErr } = await supabase
      .from('quote_versions')
      .insert({
        company_id: cid,
        estimate_id: estimateId,
        version_number: nextVer,
        label: payload.label ?? null,
        status: 'draft',

        intro_title: quote?.intro_title ?? 'Quotation',
        intro_body_rich: quote?.intro_body_rich ?? {},
        programme_notes_rich: quote?.programme_notes_rich ?? {},
        payment_notes_rich: quote?.payment_notes_rich ?? {},
        warranty_notes_rich: quote?.warranty_notes_rich ?? {},
        terms_body_rich: quote?.terms_body_rich ?? {},

        inclusions: quote?.inclusions ?? [],
        exclusions: quote?.exclusions ?? [],
        assumptions: quote?.assumptions ?? [],

        show_pricing_breakdown: quote?.show_pricing_breakdown ?? true,
        show_section_details: quote?.show_section_details ?? true,

        branding,

        sections_snapshot: sections ?? [],
        items_snapshot: items ?? [],

        subtotal: est.subtotal ?? 0,
        vat_rate: est.vat_rate ?? 0,
        vat_amount: est.vat_amount ?? 0,
        total: est.total ?? 0,
      })
      .select('*')
      .single();
    if (cErr) throw cErr;

    return created;
  },

  async markStatus(companyId: string | null | undefined, versionId: string, status: string) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('quote_versions')
      .update({ status })
      .eq('company_id', cid)
      .eq('id', versionId);
    if (error) throw error;
  },

  async get(companyId: string | null | undefined, versionId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('quote_versions')
      .select('*')
      .eq('company_id', cid)
      .eq('id', versionId)
      .single();
    if (error) throw error;
    return data;
  },
};

