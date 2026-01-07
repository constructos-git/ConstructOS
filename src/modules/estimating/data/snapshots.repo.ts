import { supabase } from '@/lib/supabase';
import { lastBuyRepo } from '../rates/repos/lastBuy.repo';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const snapshotsRepo = {
  async listWorkOrderSnapshots(companyId: string | null | undefined, workOrderId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('work_order_line_snapshots')
      .select('*')
      .eq('company_id', cid)
      .eq('work_order_id', workOrderId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async listPurchaseOrderSnapshots(companyId: string | null | undefined, purchaseOrderId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('purchase_order_line_snapshots')
      .select('*')
      .eq('company_id', cid)
      .eq('purchase_order_id', purchaseOrderId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async createWorkOrderSnapshots(companyId: string | null | undefined, workOrderId: string, quoteVersionId: string, items: any[]) {
    const cid = getCompanyId(companyId);
    const inserts = items.map((item, idx) => ({
      company_id: cid,
      work_order_id: workOrderId,
      source_quote_version_id: quoteVersionId,
      source_estimate_item_id: item.id,
      sort_order: idx,
      item_type: item.item_type,
      title: item.title,
      description: item.description ?? null,
      quantity: item.quantity,
      unit: item.unit,
      unit_cost: item.unit_cost ?? 0,
      line_cost: item.line_cost ?? 0,
    }));
    if (inserts.length) {
      const { error } = await supabase.from('work_order_line_snapshots').insert(inserts);
      if (error) throw error;
    }
  },

  async createPurchaseOrderSnapshots(companyId: string | null | undefined, purchaseOrderId: string, quoteVersionId: string, items: any[]) {
    const cid = getCompanyId(companyId);
    const inserts = items.map((item, idx) => ({
      company_id: cid,
      purchase_order_id: purchaseOrderId,
      source_quote_version_id: quoteVersionId,
      source_estimate_item_id: item.id,
      sort_order: idx,
      item_type: item.item_type,
      title: item.title,
      description: item.description ?? null,
      quantity: item.quantity,
      unit: item.unit,
      unit_cost: item.unit_cost ?? 0,
      line_cost: item.line_cost ?? 0,
    }));
    if (inserts.length) {
      const { error } = await supabase.from('purchase_order_line_snapshots').insert(inserts);
      if (error) throw error;

      // Get PO supplier info for last buy tracking
      const { data: po } = await supabase
        .from('purchase_orders')
        .select('supplier_name')
        .eq('company_id', cid)
        .eq('id', purchaseOrderId)
        .single();

      // Update last buy costs from snapshots
      for (const snap of inserts) {
        if (snap.item_type === 'material' || snap.item_type === 'plant') {
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

