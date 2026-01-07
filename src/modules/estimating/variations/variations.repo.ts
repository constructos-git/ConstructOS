import { supabase } from '@/lib/supabase';
import { tokensRepo } from '../data/tokens.repo';
import { computeEstimateTotals } from '../rates/engine/pricingEngine';
import type { PricingSettings, LineInput } from '../rates/engine/types';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export type VariationLine = {
  itemType: 'material' | 'labour' | 'plant' | 'subcontract' | 'combined';
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  unitCost: number;
  priceExVat: number;
  vat: number;
  totalIncVat: number;
};

export const variationsRepo = {
  async list(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_variations')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getById(companyId: string | null | undefined, variationId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_variations')
      .select('*')
      .eq('company_id', cid)
      .eq('id', variationId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(companyId: string | null | undefined, estimateId: string, payload: {
    title: string;
    description?: string;
    lines: VariationLine[];
    vatRate?: number;
    pricingSettings?: PricingSettings;
  }) {
    const cid = getCompanyId(companyId);
    const vatRate = payload.vatRate ?? 20;

    // Compute totals using pricing engine if available
    let subtotal = 0;
    let vatAmount = 0;
    let total = 0;

    if (payload.pricingSettings) {
      const lineInputs: LineInput[] = payload.lines
        .filter((line) => line.itemType !== 'combined')
        .map((line) => ({
          itemType: line.itemType as 'material' | 'labour' | 'plant' | 'subcontract',
          quantity: line.quantity,
          unitCost: line.unitCost,
          fixedPriceExVat: line.priceExVat,
        }));
      const result = computeEstimateTotals(payload.pricingSettings, lineInputs);
      subtotal = Number(result.subtotalExVat.toFixed(2));
      vatAmount = Number(result.vat.toFixed(2));
      total = Number(result.total.toFixed(2));
    } else {
      // Fallback calculation
      subtotal = payload.lines.reduce((sum, line) => sum + line.priceExVat, 0);
      vatAmount = subtotal * (vatRate / 100);
      total = subtotal + vatAmount;
    }

    const { data, error } = await supabase
      .from('estimate_variations')
      .insert({
        company_id: cid,
        estimate_id: estimateId,
        title: payload.title,
        description: payload.description || null,
        lines: payload.lines,
        subtotal: Number(subtotal.toFixed(2)),
        vat_rate: vatRate,
        vat_amount: Number(vatAmount.toFixed(2)),
        total: Number(total.toFixed(2)),
        status: 'draft',
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async update(companyId: string | null | undefined, variationId: string, patch: Partial<{
    title: string;
    description: string;
    lines: VariationLine[];
    status: string;
  }>) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimate_variations')
      .update(patch)
      .eq('company_id', cid)
      .eq('id', variationId);
    if (error) throw error;
  },

  async markSent(companyId: string | null | undefined, variationId: string) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimate_variations')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('company_id', cid)
      .eq('id', variationId);
    if (error) throw error;
  },

  async createToken(companyId: string | null | undefined, variationId: string, expiresDays?: number) {
    const cid = getCompanyId(companyId);
    return tokensRepo.create(cid, 'variation', variationId, expiresDays);
  },
};

