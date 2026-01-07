// Bundles Repository

import { supabase } from '@/lib/supabase';
import type { Bundle } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const bundlesRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data: bundles, error: bundlesError } = await supabase
      .from('estimate_builder_ai_bundles')
      .select('*')
      .eq('company_id', cid)
      .order('name', { ascending: true });
    if (bundlesError) throw bundlesError;

    // Load items for each bundle
    const bundlesWithItems = await Promise.all(
      (bundles || []).map(async (bundle) => {
        const { data: items, error: itemsError } = await supabase
          .from('estimate_builder_ai_bundle_items')
          .select('*')
          .eq('company_id', cid)
          .eq('bundle_id', bundle.id)
          .order('sort_order', { ascending: true });
        if (itemsError) throw itemsError;

        return {
          id: bundle.id,
          name: bundle.name,
          templateIds: bundle.template_ids || [],
          conditions: bundle.conditions_json,
          description: bundle.description,
          assemblyRefs: (items || []).map((item) => ({
            assemblyId: item.assembly_id,
            overrideQtyFormula: item.override_qty_formula,
          })),
        } as Bundle;
      })
    );

    return bundlesWithItems;
  },

  async get(companyId: string | null | undefined, bundleId: string) {
    const cid = getCompanyId(companyId);
    const { data: bundle, error: bundleError } = await supabase
      .from('estimate_builder_ai_bundles')
      .select('*')
      .eq('company_id', cid)
      .eq('id', bundleId)
      .single();
    if (bundleError) throw bundleError;

    const { data: items, error: itemsError } = await supabase
      .from('estimate_builder_ai_bundle_items')
      .select('*')
      .eq('company_id', cid)
      .eq('bundle_id', bundleId)
      .order('sort_order', { ascending: true });
    if (itemsError) throw itemsError;

    return {
      id: bundle.id,
      name: bundle.name,
      templateIds: bundle.template_ids || [],
      conditions: bundle.conditions_json,
      description: bundle.description,
      assemblyRefs: (items || []).map((item) => ({
        assemblyId: item.assembly_id,
        overrideQtyFormula: item.override_qty_formula,
      })),
    } as Bundle;
  },

  async create(companyId: string | null | undefined, bundle: Omit<Bundle, 'id'>) {
    const cid = getCompanyId(companyId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: newBundle, error: bundleError } = await supabase
      .from('estimate_builder_ai_bundles')
      .insert({
        company_id: cid,
        name: bundle.name,
        template_ids: bundle.templateIds || [],
        conditions_json: bundle.conditions || null,
        description: bundle.description || null,
        is_seed: false,
        created_by: user.id,
      })
      .select('*')
      .single();
    if (bundleError) throw bundleError;

    // Insert items
    if (bundle.assemblyRefs.length > 0) {
      const itemsToInsert = bundle.assemblyRefs.map((ref, index) => ({
        company_id: cid,
        bundle_id: newBundle.id,
        assembly_id: ref.assemblyId,
        sort_order: index,
        override_qty_formula: ref.overrideQtyFormula || null,
      }));

      const { error: itemsError } = await supabase
        .from('estimate_builder_ai_bundle_items')
        .insert(itemsToInsert);
      if (itemsError) throw itemsError;
    }

    return newBundle.id;
  },

  async recordApplication(companyId: string | null | undefined, estimateId: string, bundleId: string) {
    const cid = getCompanyId(companyId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('estimate_builder_ai_bundle_applications')
      .insert({
        company_id: cid,
        estimate_id: estimateId,
        bundle_id: bundleId,
        applied_by: user.id,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
};

