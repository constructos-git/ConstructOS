import type { EstimateStatus, VariationStatus } from './workflowTypes';

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export const workflowRules = {
  async validateEstimateTransition(
    estimate: any,
    _toStatus: EstimateStatus,
    validations?: string[]
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    if (validations) {
      for (const validation of validations) {
        switch (validation) {
          case 'hasTotals':
            if (!estimate.total || Number(estimate.total) <= 0) {
              errors.push('Estimate must have a total greater than 0');
            }
            break;
          case 'hasAtLeastOneVersion':
            // This would need to check quote_versions table
            // For now, assume valid if estimate exists
            break;
          case 'hasLayoutOrDefault':
            // Check if quote has layout assigned or default exists
            // For now, assume valid
            break;
          case 'hasScopeItems':
            // Check if estimate has items
            // For now, assume valid
            break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  async validateVariationTransition(
    variation: any,
    toStatus: VariationStatus
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    if (toStatus === 'sent') {
      if (!variation.lines || variation.lines.length === 0) {
        errors.push('Variation must have at least one line item');
      }
      if (!variation.title || !variation.title.trim()) {
        errors.push('Variation must have a title');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

