import { supabase } from '@/lib/supabase';
import { computeLine, deriveUnitPrice, round2 } from '../domain/estimating.engine';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const estimateItemsRepo = {
  async list(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_items')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(companyId: string | null | undefined, estimateId: string, sectionId: string | null, sortOrder: number) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_items')
      .insert({
        company_id: cid,
        estimate_id: estimateId,
        section_id: sectionId,
        sort_order: sortOrder,
        item_type: 'combined',
        title: 'New item',
        quantity: 1,
        unit: 'item',
        unit_cost: 0,
        unit_price: 0,
        margin_percent: 0,
        line_cost: 0,
        line_total: 0,
        is_client_visible: true,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async update(companyId: string | null | undefined, itemId: string, patch: any) {
    const cid = getCompanyId(companyId);
    // If margin_percent and unit_cost provided and unit_price not provided, derive unit_price
    const updates: any = { ...patch };

    const willDerive = typeof updates.unit_cost === 'number' && typeof updates.margin_percent === 'number' && typeof updates.unit_price !== 'number';
    if (willDerive) {
      updates.unit_price = deriveUnitPrice(updates.unit_cost, updates.margin_percent);
    }

    // If qty/cost/price changed, recompute line_cost/line_total
    const needsLine =
      typeof updates.quantity === 'number' ||
      typeof updates.unit_cost === 'number' ||
      typeof updates.unit_price === 'number';

    if (needsLine) {
      // Read current if required fields missing
      const { data: current, error: readErr } = await supabase
        .from('estimate_items')
        .select('quantity, unit_cost, unit_price')
        .eq('company_id', cid)
        .eq('id', itemId)
        .single();
      if (readErr) throw readErr;

      const q = typeof updates.quantity === 'number' ? updates.quantity : Number(current.quantity);
      const uc = typeof updates.unit_cost === 'number' ? updates.unit_cost : Number(current.unit_cost);
      const up = typeof updates.unit_price === 'number' ? updates.unit_price : Number(current.unit_price);

      const lines = computeLine(q, uc, up);
      updates.line_cost = lines.line_cost;
      updates.line_total = lines.line_total;
    }

    // Normalize numeric fields
    if (typeof updates.quantity === 'number') updates.quantity = round2(updates.quantity);
    if (typeof updates.unit_cost === 'number') updates.unit_cost = round2(updates.unit_cost);
    if (typeof updates.unit_price === 'number') updates.unit_price = round2(updates.unit_price);
    if (typeof updates.margin_percent === 'number') updates.margin_percent = round2(updates.margin_percent);

    const { error } = await supabase
      .from('estimate_items')
      .update(updates)
      .eq('company_id', cid)
      .eq('id', itemId);
    if (error) throw error;
  },

  async remove(companyId: string | null | undefined, itemId: string) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimate_items')
      .delete()
      .eq('company_id', cid)
      .eq('id', itemId);
    if (error) throw error;
  },
};

