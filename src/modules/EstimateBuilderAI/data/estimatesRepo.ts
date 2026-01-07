// Estimate Builder AI - Estimates Repository

import { supabase } from '@/lib/supabase';
import type {
  EstimateBuilderAIEstimate,
  EstimateBrief,
  InternalCosting,
  CustomerEstimate,
  VisibilitySettings,
} from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const estimateBuilderAIEstimatesRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_builder_ai_estimates')
      .select('*')
      .eq('company_id', cid)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as EstimateBuilderAIEstimate[];
  },

  async get(companyId: string | null | undefined, id: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_builder_ai_estimates')
      .select('*')
      .eq('company_id', cid)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as EstimateBuilderAIEstimate | null;
  },

  async create(
    companyId: string | null | undefined,
    payload: {
      templateId: string;
      title: string;
      estimateBrief: EstimateBrief;
      clientId?: string;
      projectId?: string;
      opportunityId?: string;
    }
  ) {
    const cid = getCompanyId(companyId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('estimate_builder_ai_estimates')
      .insert({
        company_id: cid,
        template_id: payload.templateId,
        title: payload.title,
        estimate_brief: payload.estimateBrief,
        status: 'draft',
        client_id: payload.clientId || null,
        project_id: payload.projectId || null,
        opportunity_id: payload.opportunityId || null,
        visibility_settings: {
          showSectionTotals: true,
          showVat: true,
          showTotalsWithVat: true,
          showTotalsWithoutVat: false,
          showProvisionalSums: true,
          showGrandTotalOnly: false,
          showDescriptions: true,
          showLabourItems: true,
          showMaterialItems: true,
          showLineTotals: true,
          showQuantities: true,
          showUnits: true,
          showNotes: true,
        },
        created_by: user.id,
        updated_by: user.id,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as EstimateBuilderAIEstimate;
  },

  async update(
    companyId: string | null | undefined,
    id: string,
    patch: {
      title?: string;
      status?: string;
      internalCosting?: InternalCosting;
      customerEstimate?: CustomerEstimate;
      visibilitySettings?: VisibilitySettings;
      clientId?: string;
      projectId?: string;
      opportunityId?: string;
    }
  ) {
    const cid = getCompanyId(companyId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    if (patch.title !== undefined) updateData.title = patch.title;
    if (patch.status !== undefined) updateData.status = patch.status;
    if (patch.internalCosting !== undefined) updateData.internal_costing = patch.internalCosting;
    if (patch.customerEstimate !== undefined) updateData.customer_estimate = patch.customerEstimate;
    if (patch.visibilitySettings !== undefined) updateData.visibility_settings = patch.visibilitySettings;
    if (patch.clientId !== undefined) updateData.client_id = patch.clientId;
    if (patch.projectId !== undefined) updateData.project_id = patch.projectId;
    if (patch.opportunityId !== undefined) updateData.opportunity_id = patch.opportunityId;

    const { data, error } = await supabase
      .from('estimate_builder_ai_estimates')
      .update(updateData)
      .eq('company_id', cid)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as EstimateBuilderAIEstimate;
  },

  async delete(companyId: string | null | undefined, id: string) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimate_builder_ai_estimates')
      .delete()
      .eq('company_id', cid)
      .eq('id', id);
    if (error) throw error;
  },

  async saveAnswers(
    companyId: string | null | undefined,
    estimateId: string,
    answers: Record<string, any>
  ) {
    const cid = getCompanyId(companyId);
    
    // Delete existing answers
    await supabase
      .from('estimate_builder_ai_answers')
      .delete()
      .eq('company_id', cid)
      .eq('estimate_id', estimateId);

    // Insert new answers
    const answerRecords = Object.entries(answers).map(([questionId, answerValue]) => ({
      company_id: cid,
      estimate_id: estimateId,
      question_id: questionId,
      answer_value: answerValue,
    }));

    if (answerRecords.length > 0) {
      const { error } = await supabase
        .from('estimate_builder_ai_answers')
        .insert(answerRecords);
      if (error) throw error;
    }
  },

  async getAnswers(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_builder_ai_answers')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId);
    if (error) throw error;
    
    const answers: Record<string, any> = {};
    (data ?? []).forEach((record: any) => {
      answers[record.question_id] = record.answer_value;
    });
    return answers;
  },
};

