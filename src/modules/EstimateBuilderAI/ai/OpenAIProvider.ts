// OpenAI Provider (Placeholder - can be enabled later with API key)

import type { IEstimateAIProvider } from './IEstimateAIProvider';
import type {
  EstimateBrief,
  InternalCosting,
  CustomerEstimate,
  VisibilitySettings,
} from '../domain/types';
import { MockEstimateAIProvider } from './MockEstimateAIProvider';

/**
 * OpenAI Provider Adapter
 * 
 * This is a placeholder implementation that can be enabled later.
 * To enable:
 * 1. Set VITE_OPENAI_API_KEY in environment variables
 * 2. Implement the actual OpenAI API calls
 * 3. Replace the mock provider fallback with real API calls
 * 
 * For now, this falls back to MockEstimateAIProvider
 */
export class OpenAIProvider implements IEstimateAIProvider {
  private mockProvider: MockEstimateAIProvider;
  private apiKey: string | undefined;

  constructor() {
    this.mockProvider = new MockEstimateAIProvider();
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  }

  async generateEstimate(brief: EstimateBrief): Promise<{
    internalCosting: InternalCosting;
    customerEstimate: CustomerEstimate;
    visibilitySettings: VisibilitySettings;
  }> {
    // If no API key, fall back to mock provider
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured. Using mock provider.');
      return this.mockProvider.generateEstimate(brief);
    }

    // TODO: Implement actual OpenAI API calls
    // Example structure:
    // 1. Build prompt from brief
    // 2. Call OpenAI API with structured prompt
    // 3. Parse response into InternalCosting and CustomerEstimate
    // 4. Return results

    // For now, use mock provider
    return this.mockProvider.generateEstimate(brief);
  }

  // TODO: Implement buildPrompt and parseResponse methods when OpenAI integration is needed
  // private buildPrompt(brief: EstimateBrief): string { ... }
  // private parseResponse(response: string): { ... } { ... }
}

