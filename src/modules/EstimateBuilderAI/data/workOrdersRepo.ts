// Work Orders Repository

import { supabase } from '@/lib/supabase';
import type { WorkOrder, WorkOrderItem } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const workOrdersRepo = {
  async list(companyId: string | null | undefined, estimateId?: string) {
    const cid = getCompanyId(companyId);
    let query = supabase
      .from('estimate_builder_ai_work_orders')
      .select('*')
      .eq('company_id', cid);
    
    if (estimateId) {
      query = query.eq('estimate_id', estimateId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as WorkOrder[];
  },

  async get(companyId: string | null | undefined, id: string) {
    const cid = getCompanyId(companyId);
    const { data: wo, error: woError } = await supabase
      .from('estimate_builder_ai_work_orders')
      .select('*')
      .eq('company_id', cid)
      .eq('id', id)
      .single();
    if (woError) throw woError;

    const { data: items, error: itemsError } = await supabase
      .from('estimate_builder_ai_wo_items')
      .select('*')
      .eq('company_id', cid)
      .eq('wo_id', id)
      .order('sort_order', { ascending: true });
    if (itemsError) throw itemsError;

    return {
      ...wo,
      items: items ?? [],
    } as WorkOrder;
  },

  async create(companyId: string | null | undefined, payload: {
    estimateId: string;
    contractorName?: string;
    contractorId?: string;
    pricingMode: 'fixed' | 'schedule';
    fixedPrice?: number;
    scopeText?: string;
    notes?: string;
    items?: (Omit<WorkOrderItem, 'id' | 'woId' | 'createdAt' | 'sortOrder'> & { sortOrder?: number })[];
  }) {
    const cid = getCompanyId(companyId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate WO number
    const woNumber = `WO-${Date.now()}`;

    const { data: wo, error: woError } = await supabase
      .from('estimate_builder_ai_work_orders')
      .insert({
        company_id: cid,
        estimate_id: payload.estimateId,
        contractor_name: payload.contractorName,
        contractor_id: payload.contractorId,
        wo_number: woNumber,
        pricing_mode: payload.pricingMode,
        fixed_price: payload.fixedPrice,
        scope_text: payload.scopeText,
        notes: payload.notes,
        status: 'draft',
        created_by: user.id,
      })
      .select('*')
      .single();
    if (woError) throw woError;

    // Insert items (for schedule mode)
    if (payload.items && payload.items.length > 0) {
      const itemsToInsert = payload.items.map((item, index) => ({
        company_id: cid,
        wo_id: wo.id,
        estimate_item_id: item.estimateItemId,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unitPrice,
        sort_order: item.sortOrder ?? index,
      }));

      const { error: itemsError } = await supabase
        .from('estimate_builder_ai_wo_items')
        .insert(itemsToInsert);
      if (itemsError) throw itemsError;
    }

    return {
      ...wo,
      items: payload.items?.map((item, index) => ({
        ...item,
        id: `item-${index}`,
        woId: wo.id,
        createdAt: new Date().toISOString(),
      })) ?? [],
    } as WorkOrder;
  },

  async update(companyId: string | null | undefined, id: string, patch: Partial<WorkOrder>) {
    const cid = getCompanyId(companyId);
    const updateData: any = {};
    
    if (patch.contractorName !== undefined) updateData.contractor_name = patch.contractorName;
    if (patch.contractorId !== undefined) updateData.contractor_id = patch.contractorId;
    if (patch.status !== undefined) updateData.status = patch.status;
    if (patch.pricingMode !== undefined) updateData.pricing_mode = patch.pricingMode;
    if (patch.fixedPrice !== undefined) updateData.fixed_price = patch.fixedPrice;
    if (patch.scopeText !== undefined) updateData.scope_text = patch.scopeText;
    if (patch.notes !== undefined) updateData.notes = patch.notes;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('estimate_builder_ai_work_orders')
      .update(updateData)
      .eq('company_id', cid)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as WorkOrder;
  },
};

