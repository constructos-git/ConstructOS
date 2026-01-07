// Briefs Repository

import { supabase } from '@/lib/supabase';
import type { EstimateBriefContent } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const briefsRepo = {
  async get(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_builder_ai_briefs')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as {
      id: string;
      estimate_id: string;
      brief_json: EstimateBriefContent;
      brief_markdown: string | null;
      assumptions: string | null;
      exclusions: string | null;
      created_at: string;
      updated_at: string;
      updated_by: string | null;
    } | null;
  },

  async create(companyId: string | null | undefined, estimateId: string, brief: EstimateBriefContent, markdown?: string, assumptions?: string, exclusions?: string) {
    const cid = getCompanyId(companyId);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('estimate_builder_ai_briefs')
      .insert({
        company_id: cid,
        estimate_id: estimateId,
        brief_json: brief,
        brief_markdown: markdown || null,
        assumptions: assumptions || null,
        exclusions: exclusions || null,
        updated_by: user?.id || null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async update(companyId: string | null | undefined, estimateId: string, updates: {
    briefJson?: EstimateBriefContent;
    briefMarkdown?: string;
    assumptions?: string;
    exclusions?: string;
  }) {
    const cid = getCompanyId(companyId);
    const { data: { user } } = await supabase.auth.getUser();
    
    const updateData: any = {
      updated_at: new Date().toISOString(),
      updated_by: user?.id || null,
    };

    if (updates.briefJson !== undefined) updateData.brief_json = updates.briefJson;
    if (updates.briefMarkdown !== undefined) updateData.brief_markdown = updates.briefMarkdown;
    if (updates.assumptions !== undefined) updateData.assumptions = updates.assumptions;
    if (updates.exclusions !== undefined) updateData.exclusions = updates.exclusions;

    const { data, error } = await supabase
      .from('estimate_builder_ai_briefs')
      .update(updateData)
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },
};

