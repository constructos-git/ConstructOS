import { supabase } from '@/lib/supabase';
import { evalQuantityExpr, computeLine, deriveUnitPrice } from '../domain/estimating.engine';
import { evalExpression } from '../lib/expression';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const assembliesRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_assemblies')
      .select('*')
      .eq('company_id', cid)
      .eq('is_active', true)
      .order('category', { ascending: true });
    if (error) {
      // Table might not exist yet - return empty array
      if (error.code === 'PGRST116' || error.code === '42P01' || error.code === 'PGRST205') {
        return [];
      }
      throw error;
    }
    return data ?? [];
  },

  async listItems(companyId: string | null | undefined, assemblyId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_assembly_items')
      .select('*')
      .eq('company_id', cid)
      .eq('assembly_id', assemblyId)
      .order('sort_order', { ascending: true });
    if (error) {
      // Table might not exist yet - return empty array
      if (error.code === 'PGRST116' || error.code === '42P01' || error.code === 'PGRST205') {
        return [];
      }
      throw error;
    }
    return data ?? [];
  },

  async createAssembly(companyId: string | null | undefined, name: string, category?: string, description?: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_assemblies')
      .insert({
        company_id: cid,
        name,
        category: category ?? null,
        description: description ?? null,
        version: 1,
        is_active: true,
      })
      .select('*')
      .single();
    if (error) {
      // Handle table missing, RLS, or duplicate key errors gracefully
      if (error.code === 'PGRST116' || error.code === '42P01' || error.code === 'PGRST205') {
        console.warn('estimate_assemblies table does not exist. Please run migrations.');
        return null;
      }
      // RLS or duplicate key - return null gracefully
      if (error.code === '42501' || error.code === '23505' || error.message?.includes('permission denied') || error.message?.includes('duplicate key')) {
        return null;
      }
      throw error;
    }
    return data;
  },

  async addAssemblyItem(companyId: string | null | undefined, assemblyId: string, item: any) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_assembly_items')
      .insert({
        company_id: cid,
        assembly_id: assemblyId,
        sort_order: item.sort_order ?? 0,
        item_type: item.item_type ?? 'combined',
        title: item.title,
        description: item.description ?? null,
        quantity_expr: item.quantity_expr ?? '1',
        unit: item.unit ?? 'item',
        unit_cost: item.unit_cost ?? 0,
        unit_price: item.unit_price ?? 0,
        margin_percent: item.margin_percent ?? 0,
        is_client_visible: item.is_client_visible ?? true,
      })
      .select('*')
      .single();
    if (error) {
      // Table might not exist yet
      if (error.code === 'PGRST116' || error.code === '42P01' || error.code === 'PGRST205') {
        console.warn('estimate_assembly_items table does not exist. Please run migrations.');
        return null;
      }
      throw error;
    }
    return data;
  },

  async applyToEstimate(companyId: string | null | undefined, estimateId: string, sectionId: string | null, assemblyId: string, vars: Record<string, number>) {
    const cid = getCompanyId(companyId);
    const templateItems = await this.listItems(cid, assemblyId);
    if (!templateItems.length) return;

    // Determine next sort order in estimate
    const { data: existing, error: exErr } = await supabase
      .from('estimate_items')
      .select('sort_order')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .order('sort_order', { ascending: false })
      .limit(1);
    if (exErr) throw exErr;

    const sortBase = existing?.[0]?.sort_order ? Number(existing[0].sort_order) + 1 : 0;

    const inserts = templateItems.map((t: any, idx: number) => {
      // Use qty_expression if present, otherwise fallback to quantity_expr or default
      let qty: number;
      if (t.qty_expression) {
        qty = evalExpression(t.qty_expression, vars);
      } else if (t.quantity_expr) {
        qty = evalQuantityExpr(String(t.quantity_expr), vars);
      } else {
        qty = Number(t.default_quantity ?? 1);
      }
      const unitCost = Number(t.unit_cost ?? 0);
      const margin = Number(t.margin_percent ?? 0);
      const unitPrice = Number(t.unit_price ?? 0) > 0 ? Number(t.unit_price) : deriveUnitPrice(unitCost, margin);
      const lines = computeLine(qty, unitCost, unitPrice);

      return {
        company_id: cid,
        estimate_id: estimateId,
        section_id: sectionId,
        sort_order: sortBase + idx,
        item_type: t.item_type ?? 'combined',
        title: t.title,
        description: t.description ?? null,
        quantity: qty,
        unit: t.unit ?? 'item',
        unit_cost: unitCost,
        unit_price: unitPrice,
        margin_percent: margin,
        line_cost: lines.line_cost,
        line_total: lines.line_total,
        is_client_visible: t.is_client_visible ?? true,
      };
    });

    const { error } = await supabase.from('estimate_items').insert(inserts);
    if (error) throw error;
  },
};

