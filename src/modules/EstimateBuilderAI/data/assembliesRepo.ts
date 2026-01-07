// Assemblies Repository

import { supabase } from '@/lib/supabase';
import type { Assembly } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const assembliesRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data: assemblies, error: assembliesError } = await supabase
      .from('estimate_builder_ai_assemblies')
      .select('*')
      .eq('company_id', cid)
      .order('name', { ascending: true });
    if (assembliesError) throw assembliesError;

    // Load lines for each assembly
    const assembliesWithLines = await Promise.all(
      (assemblies || []).map(async (assembly) => {
        const { data: lines, error: linesError } = await supabase
          .from('estimate_builder_ai_assembly_lines')
          .select('*')
          .eq('company_id', cid)
          .eq('assembly_id', assembly.id)
          .order('sort_order', { ascending: true });
        if (linesError) throw linesError;

        return {
          id: assembly.id,
          name: assembly.name,
          category: assembly.category,
          defaultUnit: assembly.default_unit,
          description: assembly.description,
          lines: (lines || []).map((line) => ({
            id: line.id,
            title: line.title,
            costType: line.cost_type,
            qtyFormula: line.qty_formula,
            unit: line.unit,
            baseUnitCost: line.base_unit_cost,
            defaultMarkupPct: line.default_markup_pct,
            vatApplicable: line.vat_applicable,
            customerTextBlock: line.customer_text_block,
          })),
        } as Assembly;
      })
    );

    return assembliesWithLines;
  },

  async get(companyId: string | null | undefined, assemblyId: string) {
    const cid = getCompanyId(companyId);
    const { data: assembly, error: assemblyError } = await supabase
      .from('estimate_builder_ai_assemblies')
      .select('*')
      .eq('company_id', cid)
      .eq('id', assemblyId)
      .single();
    if (assemblyError) throw assemblyError;

    const { data: lines, error: linesError } = await supabase
      .from('estimate_builder_ai_assembly_lines')
      .select('*')
      .eq('company_id', cid)
      .eq('assembly_id', assemblyId)
      .order('sort_order', { ascending: true });
    if (linesError) throw linesError;

    return {
      id: assembly.id,
      name: assembly.name,
      category: assembly.category,
      defaultUnit: assembly.default_unit,
      description: assembly.description,
      lines: (lines || []).map((line) => ({
        id: line.id,
        title: line.title,
        costType: line.cost_type,
        qtyFormula: line.qty_formula,
        unit: line.unit,
        baseUnitCost: line.base_unit_cost,
        defaultMarkupPct: line.default_markup_pct,
        vatApplicable: line.vat_applicable,
        customerTextBlock: line.customer_text_block,
      })),
    } as Assembly;
  },

  async create(companyId: string | null | undefined, assembly: Omit<Assembly, 'id'>) {
    const cid = getCompanyId(companyId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: newAssembly, error: assemblyError } = await supabase
      .from('estimate_builder_ai_assemblies')
      .insert({
        company_id: cid,
        name: assembly.name,
        category: assembly.category,
        default_unit: assembly.defaultUnit,
        description: assembly.description,
        is_seed: false,
        created_by: user.id,
      })
      .select('*')
      .single();
    if (assemblyError) throw assemblyError;

    // Insert lines
    if (assembly.lines.length > 0) {
      const linesToInsert = assembly.lines.map((line, index) => ({
        company_id: cid,
        assembly_id: newAssembly.id,
        title: line.title,
        cost_type: line.costType,
        qty_formula: line.qtyFormula,
        unit: line.unit,
        base_unit_cost: line.baseUnitCost,
        default_markup_pct: line.defaultMarkupPct,
        vat_applicable: line.vatApplicable,
        customer_text_block: line.customerTextBlock || null,
        sort_order: index,
      }));

      const { error: linesError } = await supabase
        .from('estimate_builder_ai_assembly_lines')
        .insert(linesToInsert);
      if (linesError) throw linesError;
    }

    return newAssembly.id;
  },
};

