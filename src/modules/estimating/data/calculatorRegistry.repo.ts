import { supabase } from '@/lib/supabase';
import { getAllCalculators } from '../calculators/registry';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const calculatorRegistryRepo = {
  async seed(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const calculators = getAllCalculators();

    try {
      for (const calc of calculators) {
        try {
          const { data: existing } = await supabase
            .from('calculator_registry')
            .select('id')
            .eq('company_id', cid)
            .eq('key', calc.schema.key)
            .maybeSingle();

          if (!existing) {
            const { error: insertErr } = await supabase.from('calculator_registry').insert({
              company_id: cid,
              key: calc.schema.key,
              name: calc.schema.name,
              description: calc.schema.description || null,
              category: calc.schema.category,
              tags: calc.schema.tags?.join(',') || null,
              ui_schema: calc.schema.fields,
              is_enabled: true,
            });
            if (insertErr && insertErr.code !== 'PGRST116' && insertErr.code !== '42P01' && insertErr.code !== 'PGRST205') {
              console.warn(`Failed to seed calculator ${calc.schema.key}:`, insertErr);
            }
          }
        } catch (err: any) {
          // Table might not exist yet - skip this calculator
          if (err.code === 'PGRST116' || err.code === '42P01' || err.code === 'PGRST205') {
            console.warn('calculator_registry table does not exist. Please run migrations.');
            return;
          }
          throw err;
        }
      }
    } catch (err: any) {
      // Table might not exist yet
      if (err.code === 'PGRST116' || err.code === '42P01' || err.code === 'PGRST205') {
        console.warn('calculator_registry table does not exist. Please run migrations.');
        return;
      }
      throw err;
    }
  },

  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('calculator_registry')
      .select('*')
      .eq('company_id', cid)
      .eq('is_enabled', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    if (error) {
      // Table might not exist yet - return empty array
      if (error.code === 'PGRST116' || error.code === '42P01' || error.code === 'PGRST205') {
        return [];
      }
      throw error;
    }
    return data ?? [];
  },

  async toggle(companyId: string | null | undefined, key: string, enabled: boolean) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('calculator_registry')
      .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
      .eq('company_id', cid)
      .eq('key', key);
    if (error) throw error;
  },
};

