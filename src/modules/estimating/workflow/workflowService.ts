import { supabase } from '@/lib/supabase';
import { activityRepo } from '../data/activity.repo';
import { estimateTransitions, variationTransitions, type EstimateStatus, type VariationStatus } from './workflowTypes';
import { workflowRules } from './workflowRules';
import { hasEstimatingPermission } from '../security/permissions';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const workflowService = {
  async transitionEstimate(
    companyId: string | null | undefined,
    estimateId: string,
    toStatus: EstimateStatus,
    note?: string
  ) {
    const cid = getCompanyId(companyId);
    
    // Get current estimate
    const { data: estimate, error: fetchErr } = await supabase
      .from('estimates')
      .select('*')
      .eq('company_id', cid)
      .eq('id', estimateId)
      .single();
    if (fetchErr) throw fetchErr;
    if (!estimate) throw new Error('Estimate not found');

    const fromStatus = estimate.workflow_status || 'draft';

    // Check if transition is allowed
    const transition = estimateTransitions.find(
      (t) => t.from === fromStatus && t.to === toStatus
    );
    if (!transition) {
      throw new Error(`Transition from ${fromStatus} to ${toStatus} is not allowed`);
    }

    // Check permissions
    if (transition.requiresPermission) {
      if (!hasEstimatingPermission(transition.requiresPermission as any)) {
        throw new Error(`Permission required: ${transition.requiresPermission}`);
      }
    }

    // Validate
    if (transition.requiresValidation) {
      const validation = await workflowRules.validateEstimateTransition(
        estimate,
        toStatus,
        transition.requiresValidation
      );
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Update status
    const { error: updateErr } = await supabase
      .from('estimates')
      .update({
        workflow_status: toStatus,
        workflow_updated_at: new Date().toISOString(),
      })
      .eq('company_id', cid)
      .eq('id', estimateId);
    if (updateErr) throw updateErr;

    // Log activity
    await activityRepo.log(
      companyId,
      estimateId,
      'estimate',
      estimateId,
      'workflow_transition',
      `Status changed from ${fromStatus} to ${toStatus}`,
      { from: fromStatus, to: toStatus, note }
    );

    return { success: true };
  },

  async transitionVariation(
    companyId: string | null | undefined,
    variationId: string,
    toStatus: VariationStatus,
    note?: string
  ) {
    const cid = getCompanyId(companyId);

    // Get current variation
    const { data: variation, error: fetchErr } = await supabase
      .from('estimate_variations')
      .select('*')
      .eq('company_id', cid)
      .eq('id', variationId)
      .single();
    if (fetchErr) throw fetchErr;
    if (!variation) throw new Error('Variation not found');

    const fromStatus = variation.workflow_status || 'draft';

    // Check if transition is allowed
    const transition = variationTransitions.find(
      (t) => t.from === fromStatus && t.to === toStatus
    );
    if (!transition) {
      throw new Error(`Transition from ${fromStatus} to ${toStatus} is not allowed`);
    }

    // Check permissions
    if (transition.requiresPermission) {
      if (!hasEstimatingPermission(transition.requiresPermission as any)) {
        throw new Error(`Permission required: ${transition.requiresPermission}`);
      }
    }

    // Validate
    const validation = await workflowRules.validateVariationTransition(variation, toStatus);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Update status
    const { error: updateErr } = await supabase
      .from('estimate_variations')
      .update({
        workflow_status: toStatus,
        workflow_updated_at: new Date().toISOString(),
      })
      .eq('company_id', cid)
      .eq('id', variationId);
    if (updateErr) throw updateErr;

    // Log activity
    await activityRepo.log(
      companyId,
      variation.estimate_id,
      'variation',
      variationId,
      'workflow_transition',
      `Variation status changed from ${fromStatus} to ${toStatus}`,
      { from: fromStatus, to: toStatus, note }
    );

    return { success: true };
  },

  getAllowedTransitions(currentStatus: string, type: 'estimate' | 'variation'): string[] {
    const transitions = type === 'estimate' ? estimateTransitions : variationTransitions;
    return transitions
      .filter((t) => t.from === currentStatus)
      .map((t) => t.to);
  },
};

