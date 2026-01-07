import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const workOrdersRepo = {
  async listByEstimate(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getWithLines(companyId: string | null | undefined, workOrderId: string) {
    const cid = getCompanyId(companyId);
    const { data: wo, error: woErr } = await supabase
      .from('work_orders')
      .select('*')
      .eq('company_id', cid)
      .eq('id', workOrderId)
      .single();
    if (woErr) throw woErr;

    const { data: lines, error: lErr } = await supabase
      .from('work_order_lines')
      .select('*')
      .eq('company_id', cid)
      .eq('work_order_id', workOrderId)
      .order('sort_order', { ascending: true });
    if (lErr) throw lErr;

    return { workOrder: wo, lines: lines ?? [] };
  },

  async createFromEstimateItems(companyId: string | null | undefined, estimateId: string, payload: {
    title: string;
    assigned_to_name?: string;
    assigned_to_email?: string;
    vat_rate?: number;
    itemIds: string[];
  }) {
    const cid = getCompanyId(companyId);
    // Read items (labour/subcontract only recommended; UI will filter)
    const { data: items, error: itemsErr } = await supabase
      .from('estimate_items')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .in('id', payload.itemIds);
    if (itemsErr) throw itemsErr;

    const subtotal = (items ?? []).reduce((a: number, it: any) => a + Number(it.line_cost || 0), 0);
    const vatRate = Number(payload.vat_rate ?? 0);
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;

    const { data: wo, error: woErr } = await supabase
      .from('work_orders')
      .insert({
        company_id: cid,
        estimate_id: estimateId,
        title: payload.title,
        status: 'draft',
        assigned_to_name: payload.assigned_to_name ?? null,
        assigned_to_email: payload.assigned_to_email ?? null,
        subtotal: Number(subtotal.toFixed(2)),
        vat_rate: vatRate,
        vat_amount: Number(vatAmount.toFixed(2)),
        total: Number(total.toFixed(2)),
      })
      .select('*')
      .single();
    if (woErr) throw woErr;

    const inserts = (items ?? []).map((it: any, idx: number) => ({
      company_id: cid,
      work_order_id: wo.id,
      estimate_item_id: it.id,
      sort_order: idx,
      title: it.title,
      description: it.description ?? null,
      quantity: it.quantity ?? 1,
      unit: it.unit ?? 'item',
      unit_cost: it.unit_cost ?? 0,
      line_cost: it.line_cost ?? 0,
    }));

    if (inserts.length) {
      const { error: lErr } = await supabase.from('work_order_lines').insert(inserts);
      if (lErr) throw lErr;
    }

    return wo;
  },

  async update(companyId: string | null | undefined, workOrderId: string, patch: any) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('work_orders')
      .update(patch)
      .eq('company_id', cid)
      .eq('id', workOrderId);
    if (error) throw error;
  },
};

