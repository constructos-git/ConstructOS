import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const supplierPriceListsRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('supplier_price_lists')
      .select('*')
      .eq('company_id', cid)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(companyId: string | null | undefined, supplierName: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('supplier_price_lists')
      .insert({
        company_id: cid,
        supplier_name: supplierName,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async getItems(companyId: string | null | undefined, priceListId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('supplier_price_list_items')
      .select('*')
      .eq('company_id', cid)
      .eq('price_list_id', priceListId)
      .order('name', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async importItems(companyId: string | null | undefined, priceListId: string, items: Array<{
    code?: string;
    name: string;
    unit: string;
    cost: number;
    tags?: string;
  }>) {
    const cid = getCompanyId(companyId);
    const rows = items.map((item) => ({
      company_id: cid,
      price_list_id: priceListId,
      code: item.code || null,
      name: item.name,
      unit: item.unit,
      cost: item.cost,
      tags: item.tags || null,
    }));

    const { error } = await supabase
      .from('supplier_price_list_items')
      .insert(rows);
    if (error) throw error;
  },

  async search(companyId: string | null | undefined, query: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('supplier_price_list_items')
      .select(`
        *,
        supplier_price_lists!inner(supplier_name, is_active)
      `)
      .eq('company_id', cid)
      .eq('supplier_price_lists.is_active', true)
      .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
      .limit(50);
    if (error) throw error;
    return (data ?? []).map((item: any) => ({
      ...item,
      supplier_name: item.supplier_price_lists?.supplier_name,
    }));
  },
};

