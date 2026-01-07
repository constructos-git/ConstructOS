// Rate Settings Repository

import { supabase } from '@/lib/supabase';
import type { RateSettings } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const rateSettingsRepo = {
  async get(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_builder_ai_rate_settings')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    
    // Map snake_case to camelCase
    return {
      id: data.id,
      estimate_id: data.estimate_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      region: data.region || 'South East',
      regionalMultiplier: data.regional_multiplier || 1.0,
      overheadPct: data.overhead_pct || 10,
      marginPct: data.margin_pct || 15,
      contingencyPct: data.contingency_pct || 5,
      vatPct: data.vat_pct || 20,
      autoRateMode: data.auto_rate_mode !== undefined ? data.auto_rate_mode : true,
    } as RateSettings & { id: string; estimate_id: string; created_at: string; updated_at: string };
  },

  async create(companyId: string | null | undefined, estimateId: string, settings: RateSettings) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_builder_ai_rate_settings')
      .insert({
        company_id: cid,
        estimate_id: estimateId,
        region: settings.region,
        regional_multiplier: settings.regionalMultiplier,
        overhead_pct: settings.overheadPct,
        margin_pct: settings.marginPct,
        contingency_pct: settings.contingencyPct,
        vat_pct: settings.vatPct,
        auto_rate_mode: settings.autoRateMode,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async update(companyId: string | null | undefined, estimateId: string, settings: Partial<RateSettings>) {
    const cid = getCompanyId(companyId);
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (settings.region !== undefined) updateData.region = settings.region;
    if (settings.regionalMultiplier !== undefined) updateData.regional_multiplier = settings.regionalMultiplier;
    if (settings.overheadPct !== undefined) updateData.overhead_pct = settings.overheadPct;
    if (settings.marginPct !== undefined) updateData.margin_pct = settings.marginPct;
    if (settings.contingencyPct !== undefined) updateData.contingency_pct = settings.contingencyPct;
    if (settings.vatPct !== undefined) updateData.vat_pct = settings.vatPct;
    if (settings.autoRateMode !== undefined) updateData.auto_rate_mode = settings.autoRateMode;

    const { data, error } = await supabase
      .from('estimate_builder_ai_rate_settings')
      .update(updateData)
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
};

