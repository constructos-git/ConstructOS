import { supabase } from '@/lib/supabase';
import { lastBuyRepo } from '../rates/repos/lastBuy.repo';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const purchaseOrdersRepo = {
  async listByEstimate(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getWithLines(companyId: string | null | undefined, purchaseOrderId: string) {
    const cid = getCompanyId(companyId);
    const { data: po, error: poErr } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('company_id', cid)
      .eq('id', purchaseOrderId)
      .single();
    if (poErr) throw poErr;

    const { data: lines, error: lErr } = await supabase
      .from('purchase_order_lines')
      .select('*')
      .eq('company_id', cid)
      .eq('purchase_order_id', purchaseOrderId)
      .order('sort_order', { ascending: true });
    if (lErr) throw lErr;

    return { purchaseOrder: po, lines: lines ?? [] };
  },

  async createFromEstimateItems(companyId: string | null | undefined, estimateId: string, payload: {
    title: string;
    supplier_name?: string;
    supplier_email?: string;
    delivery_address?: string;
    vat_rate?: number;
    itemIds: string[];
  }) {
    const cid = getCompanyId(companyId);
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

    const { data: po, error: poErr } = await supabase
      .from('purchase_orders')
      .insert({
        company_id: cid,
        estimate_id: estimateId,
        title: payload.title,
        status: 'draft',
        supplier_name: payload.supplier_name ?? null,
        supplier_email: payload.supplier_email ?? null,
        delivery_address: payload.delivery_address ?? null,
        subtotal: Number(subtotal.toFixed(2)),
        vat_rate: vatRate,
        vat_amount: Number(vatAmount.toFixed(2)),
        total: Number(total.toFixed(2)),
      })
      .select('*')
      .single();
    if (poErr) throw poErr;

    const inserts = (items ?? []).map((it: any, idx: number) => ({
      company_id: cid,
      purchase_order_id: po.id,
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
      const { error: lErr } = await supabase.from('purchase_order_lines').insert(inserts);
      if (lErr) throw lErr;

      // Update last buy costs
      for (const line of inserts) {
        await lastBuyRepo.upsert(companyId, {
          materialName: line.title,
          unit: line.unit,
          cost: Number(line.unit_cost || 0),
          purchaseOrderId: po.id,
          supplier: payload.supplier_name,
        });
      }
    }

    return po;
  },

  async update(companyId: string | null | undefined, purchaseOrderId: string, patch: any) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('purchase_orders')
      .update(patch)
      .eq('company_id', cid)
      .eq('id', purchaseOrderId);
    if (error) throw error;

    // If status changed to 'sent' or 'received', update last buy from snapshots
    if (patch.status === 'sent' || patch.status === 'received') {
      const { data: po } = await supabase
        .from('purchase_orders')
        .select('supplier_name')
        .eq('company_id', cid)
        .eq('id', purchaseOrderId)
        .single();

      const { data: snapshots } = await supabase
        .from('purchase_order_line_snapshots')
        .select('*')
        .eq('company_id', cid)
        .eq('purchase_order_id', purchaseOrderId);

      if (snapshots) {
        for (const snap of snapshots) {
          await lastBuyRepo.upsert(companyId, {
            materialName: snap.title,
            unit: snap.unit,
            cost: Number(snap.unit_cost || 0),
            purchaseOrderId,
            supplier: po?.supplier_name,
          });
        }
      }
    }
  },
};

