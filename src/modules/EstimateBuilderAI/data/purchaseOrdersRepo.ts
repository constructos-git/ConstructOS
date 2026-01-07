// Purchase Orders Repository

import { supabase } from '@/lib/supabase';
import type { PurchaseOrder, PurchaseOrderItem } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const purchaseOrdersRepo = {
  async list(companyId: string | null | undefined, estimateId?: string) {
    const cid = getCompanyId(companyId);
    let query = supabase
      .from('estimate_builder_ai_purchase_orders')
      .select('*')
      .eq('company_id', cid);
    
    if (estimateId) {
      query = query.eq('estimate_id', estimateId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as PurchaseOrder[];
  },

  async get(companyId: string | null | undefined, id: string) {
    const cid = getCompanyId(companyId);
    const { data: po, error: poError } = await supabase
      .from('estimate_builder_ai_purchase_orders')
      .select('*')
      .eq('company_id', cid)
      .eq('id', id)
      .single();
    if (poError) throw poError;

    const { data: items, error: itemsError } = await supabase
      .from('estimate_builder_ai_po_items')
      .select('*')
      .eq('company_id', cid)
      .eq('po_id', id)
      .order('sort_order', { ascending: true });
    if (itemsError) throw itemsError;

    return {
      ...po,
      items: items ?? [],
    } as PurchaseOrder;
  },

  async create(companyId: string | null | undefined, payload: {
    estimateId: string;
    supplierName?: string;
    supplierId?: string;
    deliveryAddress?: string;
    notes?: string;
    items: (Omit<PurchaseOrderItem, 'id' | 'poId' | 'createdAt' | 'sortOrder'> & { sortOrder?: number })[];
  }) {
    const cid = getCompanyId(companyId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate PO number
    const poNumber = `PO-${Date.now()}`;

    const { data: po, error: poError } = await supabase
      .from('estimate_builder_ai_purchase_orders')
      .insert({
        company_id: cid,
        estimate_id: payload.estimateId,
        supplier_name: payload.supplierName,
        supplier_id: payload.supplierId,
        po_number: poNumber,
        delivery_address: payload.deliveryAddress,
        notes: payload.notes,
        status: 'draft',
        created_by: user.id,
      })
      .select('*')
      .single();
    if (poError) throw poError;

    // Insert items
    if (payload.items.length > 0) {
      const itemsToInsert = payload.items.map((item, index) => ({
        company_id: cid,
        po_id: po.id,
        estimate_item_id: item.estimateItemId,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unitPrice,
        sort_order: item.sortOrder ?? index,
      }));

      const { error: itemsError } = await supabase
        .from('estimate_builder_ai_po_items')
        .insert(itemsToInsert);
      if (itemsError) throw itemsError;
    }

    return {
      ...po,
      items: payload.items.map((item, index) => ({
        ...item,
        id: `item-${index}`,
        poId: po.id,
        createdAt: new Date().toISOString(),
      })),
    } as PurchaseOrder;
  },

  async update(companyId: string | null | undefined, id: string, patch: Partial<PurchaseOrder>) {
    const cid = getCompanyId(companyId);
    const updateData: any = {};
    
    if (patch.supplierName !== undefined) updateData.supplier_name = patch.supplierName;
    if (patch.supplierId !== undefined) updateData.supplier_id = patch.supplierId;
    if (patch.status !== undefined) updateData.status = patch.status;
    if (patch.deliveryAddress !== undefined) updateData.delivery_address = patch.deliveryAddress;
    if (patch.notes !== undefined) updateData.notes = patch.notes;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('estimate_builder_ai_purchase_orders')
      .update(updateData)
      .eq('company_id', cid)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as PurchaseOrder;
  },
};

