import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const lastBuyRepo = {
  async upsert(companyId: string | null | undefined, item: {
    materialCode?: string;
    materialName: string;
    unit: string;
    cost: number;
    purchaseOrderId?: string;
    supplier?: string;
  }) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('rate_last_buy')
      .upsert({
        company_id: cid,
        material_code: item.materialCode || null,
        material_name: item.materialName,
        unit: item.unit,
        last_buy_cost: item.cost,
        last_buy_at: new Date().toISOString(),
        source_purchase_order_id: item.purchaseOrderId || null,
        source_supplier: item.supplier || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'company_id,material_name,unit',
      });
    if (error) throw error;
  },

  async get(companyId: string | null | undefined, materialName: string, unit?: string) {
    const cid = getCompanyId(companyId);
    let query = supabase
      .from('rate_last_buy')
      .select('*')
      .eq('company_id', cid)
      .ilike('material_name', materialName);

    if (unit) {
      query = query.eq('unit', unit);
    }

    const { data, error } = await query
      .order('last_buy_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};

