// AI Provider Interface for Estimate Generation

import type {
  EstimateBrief,
  InternalCosting,
  CustomerEstimate,
  VisibilitySettings,
} from '../domain/types';

export interface IEstimateAIProvider {
  /**
   * Generate an estimate from a structured brief
   * @param brief - Structured estimate brief from wizard answers
   * @returns Promise with internal costing and customer estimate
   */
  generateEstimate(
    brief: EstimateBrief
  ): Promise<{
    internalCosting: InternalCosting;
    customerEstimate: CustomerEstimate;
    visibilitySettings: VisibilitySettings;
  }>;
}

