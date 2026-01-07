// Bundles Registry - Seed bundles for UK domestic construction

import type { Bundle } from './types';

export const seedBundles: Bundle[] = [
  {
    id: 'standard-single-storey-shell',
    name: 'Standard Single Storey Extension Shell',
    templateIds: ['single-storey-extension'],
    description: 'Complete shell construction for single storey extension',
    conditions: (answers) => {
      return answers.templateId === 'single-storey-extension' || true; // Default for single storey
    },
    assemblyRefs: [
      { assemblyId: 'strip-foundations' },
      { assemblyId: 'concrete-slab' },
      { assemblyId: 'external-cavity-wall' },
      { assemblyId: 'flat-roof-warm-deck' },
      { assemblyId: 'waste-skips' },
      { assemblyId: 'scaffolding' },
    ],
  },
  {
    id: 'pitched-roof-shell',
    name: 'Pitched Roof Extension Shell',
    templateIds: ['single-storey-extension'],
    description: 'Shell with pitched roof construction',
    conditions: (answers) => {
      return answers.roofType === 'pitched';
    },
    assemblyRefs: [
      { assemblyId: 'strip-foundations' },
      { assemblyId: 'concrete-slab' },
      { assemblyId: 'external-cavity-wall' },
      { assemblyId: 'pitched-roof-covering' },
      { assemblyId: 'waste-skips' },
      { assemblyId: 'scaffolding' },
    ],
  },
  {
    id: 'me-basic',
    name: 'M&E Basic',
    templateIds: ['single-storey-extension'],
    description: 'Basic mechanical and electrical installation',
    conditions: (answers) => {
      return answers.electricsLevel === 'basic' || !answers.electricsLevel;
    },
    assemblyRefs: [
      { assemblyId: 'first-fix-electrics' },
    ],
  },
  {
    id: 'me-standard',
    name: 'M&E Standard',
    templateIds: ['single-storey-extension'],
    description: 'Standard mechanical and electrical installation',
    conditions: (answers) => {
      return answers.electricsLevel === 'standard';
    },
    assemblyRefs: [
      { assemblyId: 'first-fix-electrics' },
      { assemblyId: 'heating-allowance' },
    ],
  },
  {
    id: 'me-high-spec',
    name: 'M&E High Spec',
    templateIds: ['single-storey-extension'],
    description: 'High specification mechanical and electrical installation',
    conditions: (answers) => {
      return answers.electricsLevel === 'high-spec';
    },
    assemblyRefs: [
      { assemblyId: 'first-fix-electrics' },
      { assemblyId: 'heating-allowance' },
    ],
  },
  {
    id: 'finishes-basic',
    name: 'Basic Finishes',
    templateIds: ['single-storey-extension'],
    description: 'Basic plasterboard and skim finishes',
    conditions: () => true,
    assemblyRefs: [
      { assemblyId: 'plasterboard-skim' },
    ],
  },
];

// Helper to get bundles matching conditions
export function getRecommendedBundles(answers: Record<string, any>, templateId: string): Bundle[] {
  return seedBundles.filter((bundle) => {
    // Check template match
    if (bundle.templateIds && !bundle.templateIds.includes(templateId)) {
      return false;
    }
    // Check conditions
    if (bundle.conditions) {
      return bundle.conditions(answers);
    }
    return true;
  });
}

