// Template Registry: Seed templates and schema definitions

import type {
  EstimateBuilderTemplate,
} from './types';
import { buildEstimateBrief } from './briefBuilder';

// Single Storey Extension Template (FULLY IMPLEMENTED)
const singleStoreyExtensionTemplate: EstimateBuilderTemplate = {
  id: 'single-storey-extension',
  name: 'Single Storey Extension',
  description: 'Standard single storey rear extension with configurable roof options',
  category: 'extension',
  icon: 'Home',
  steps: [
    {
      id: 'step-1',
      title: 'Location',
      description: 'Where is the extension being built?',
      questions: [
        {
          id: 'location',
          title: 'Where is the extension being built?',
          helpText: 'Select the location of your extension relative to the existing property',
          type: 'cardGrid',
          required: true,
          options: [
            {
              id: 'rear',
              label: 'Rear',
              icon: 'Home',
              value: 'rear',
              description: 'Extension to the rear of the property',
            },
            {
              id: 'side',
              label: 'Side',
              icon: 'Building2',
              value: 'side',
              description: 'Extension to the side of the property',
            },
            {
              id: 'front',
              label: 'Front',
              icon: 'Home',
              value: 'front',
              description: 'Extension to the front of the property',
            },
            {
              id: 'wraparound',
              label: 'Wraparound',
              icon: 'Layers',
              value: 'wraparound',
              description: 'Extension wrapping around a corner',
            },
          ],
        },
      ],
    },
    {
      id: 'step-dimensions',
      title: 'Dimensions',
      description: 'Enter the basic extension dimensions',
      questions: [], // Dimensions handled by DimensionsBlock component
    },
    {
      id: 'step-2',
      title: 'Knock-Through',
      description: 'Is a knock-through required?',
      questions: [
        {
          id: 'knockThrough',
          title: 'Is a knock-through required?',
          helpText: 'A knock-through connects the extension to the existing property',
          type: 'cardGrid',
          required: true,
          options: [
            {
              id: 'yes',
              label: 'Yes',
              icon: 'Wrench',
              value: true,
              description: 'Knock-through is required',
            },
            {
              id: 'no',
              label: 'No',
              icon: 'Home',
              value: false,
              description: 'No knock-through needed',
            },
          ],
        },
      ],
    },
    {
      id: 'step-3',
      title: 'Knock-Through Type',
      description: 'What type of knock-through?',
      questions: [
        {
          id: 'knockThroughType',
          title: 'What type of knock-through?',
          helpText: 'Select the type of opening you need',
          type: 'cardGrid',
          required: true,
          dependencies: [
            {
              questionId: 'knockThrough',
              condition: 'equals',
              value: true,
            },
          ],
          options: [
            {
              id: 'existing-door',
              label: 'Existing Door',
              icon: 'Home',
              value: 'existing-door',
            },
            {
              id: 'existing-window',
              label: 'Existing Window',
              icon: 'Home',
              value: 'existing-window',
            },
            {
              id: 'door-window-combo',
              label: 'Door + Window Combo',
              icon: 'Home',
              value: 'door-window-combo',
            },
            {
              id: 'french-doors',
              label: 'French Doors',
              icon: 'Home',
              value: 'french-doors',
            },
            {
              id: 'patio-sliding',
              label: 'Patio/Sliding Doors',
              icon: 'Home',
              value: 'patio-sliding',
            },
            {
              id: 'enlarge-opening',
              label: 'Enlarge Existing Opening',
              icon: 'Wrench',
              value: 'enlarge-opening',
            },
            {
              id: 'other',
              label: 'Other',
              icon: 'FileQuestion',
              value: 'other',
            },
          ],
        },
      ],
    },
    {
      id: 'step-4',
      title: 'Roof Type',
      description: 'What type of roof?',
      questions: [
        {
          id: 'roofType',
          title: 'What type of roof?',
          helpText: 'Select the roof style for your extension',
          type: 'cardGrid',
          required: true,
          options: [
            {
              id: 'flat',
              label: 'Flat',
              icon: 'Layers',
              value: 'flat',
              description: 'Flat roof',
            },
            {
              id: 'pitched',
              label: 'Pitched',
              icon: 'Home',
              value: 'pitched',
              description: 'Pitched roof',
            },
          ],
        },
        {
          id: 'roofSubType',
          title: 'Roof Sub-Type',
          helpText: 'Select additional roof details',
          type: 'cardGrid',
          required: false,
          dependencies: [
            {
              questionId: 'roofType',
              condition: 'equals',
              value: 'flat',
            },
          ],
          options: [
            {
              id: 'warm-deck',
              label: 'Warm Deck',
              icon: 'Layers',
              value: 'warm-deck',
            },
            {
              id: 'cold-deck',
              label: 'Cold Deck',
              icon: 'Layers',
              value: 'cold-deck',
            },
          ],
        },
        {
          id: 'roofPitchedDetails',
          title: 'Pitched Roof Details',
          helpText: 'Select pitched roof details',
          type: 'cardGrid',
          required: false,
          dependencies: [
            {
              questionId: 'roofType',
              condition: 'equals',
              value: 'pitched',
            },
          ],
          options: [
            {
              id: 'gable',
              label: 'Gable',
              icon: 'Home',
              value: 'gable',
            },
            {
              id: 'hipped',
              label: 'Hipped',
              icon: 'Home',
              value: 'hipped',
            },
            {
              id: 'mansard',
              label: 'Mansard',
              icon: 'Home',
              value: 'mansard',
            },
            {
              id: 'vaulted',
              label: 'Vaulted Ceiling',
              icon: 'Home',
              value: 'vaulted',
            },
            {
              id: 'standard',
              label: 'Standard Ceiling',
              icon: 'Home',
              value: 'standard',
            },
          ],
        },
      ],
    },
    {
      id: 'step-5',
      title: 'Roof Coverings',
      description: 'What roof covering?',
      questions: [
        {
          id: 'roofCovering',
          title: 'What roof covering?',
          helpText: 'Select the roof covering material',
          type: 'cardGrid',
          required: true,
          dependencies: [
            {
              questionId: 'roofType',
              condition: 'in',
              value: ['flat', 'pitched'],
            },
          ],
          options: [
            // Flat roof options
            {
              id: 'felt',
              label: 'Felt',
              icon: 'Layers',
              value: 'felt',
              description: 'Felt roofing',
            },
            {
              id: 'grp',
              label: 'GRP',
              icon: 'Layers',
              value: 'grp',
              description: 'Glass Reinforced Plastic',
            },
            {
              id: 'epdm',
              label: 'EPDM',
              icon: 'Layers',
              value: 'epdm',
              description: 'EPDM rubber roofing',
            },
            // Pitched roof options
            {
              id: 'slate',
              label: 'Slate',
              icon: 'Home',
              value: 'slate',
              description: 'Slate tiles',
            },
            {
              id: 'plain-tile',
              label: 'Plain Tile',
              icon: 'Home',
              value: 'plain-tile',
              description: 'Plain clay/concrete tiles',
            },
            {
              id: 'interlocking-tile',
              label: 'Interlocking Tile',
              icon: 'Home',
              value: 'interlocking-tile',
              description: 'Interlocking tiles',
            },
          ],
        },
      ],
    },
    {
      id: 'step-6',
      title: 'External Wall Finish',
      description: 'What finish for the external walls?',
      questions: [
        {
          id: 'wallFinish',
          title: 'What finish for the external walls?',
          helpText: 'Select the external wall finish',
          type: 'cardGrid',
          required: true,
          options: [
            {
              id: 'facing-brick',
              label: 'Facing Brick',
              icon: 'Home',
              value: 'facing-brick',
              description: 'Facing brick finish',
            },
            {
              id: 'render',
              label: 'Render',
              icon: 'Home',
              value: 'render',
              description: 'Rendered finish',
            },
            {
              id: 'cladding',
              label: 'Cladding',
              icon: 'Home',
              value: 'cladding',
              description: 'Cladding finish',
            },
            {
              id: 'other',
              label: 'Other',
              icon: 'FileQuestion',
              value: 'other',
              description: 'Other finish',
            },
          ],
        },
      ],
    },
    {
      id: 'step-7',
      title: 'Rear Opening/Doors',
      description: 'What type of doors for the rear opening?',
      questions: [
        {
          id: 'doorType',
          title: 'What type of doors for the rear opening?',
          helpText: 'Select the door type',
          type: 'cardGrid',
          required: true,
          options: [
            {
              id: 'bifold',
              label: 'Bifold',
              icon: 'Home',
              value: 'bifold',
              description: 'Bifold doors',
            },
            {
              id: 'sliding',
              label: 'Sliding',
              icon: 'Home',
              value: 'sliding',
              description: 'Sliding doors',
            },
            {
              id: 'french',
              label: 'French',
              icon: 'Home',
              value: 'french',
              description: 'French doors',
            },
            {
              id: 'patio',
              label: 'Patio',
              icon: 'Home',
              value: 'patio',
              description: 'Patio doors',
            },
            {
              id: 'none',
              label: 'None',
              icon: 'Home',
              value: 'none',
              description: 'No rear doors',
            },
          ],
        },
      ],
    },
    {
      id: 'step-8',
      title: 'Rooflights',
      description: 'How many rooflights?',
      questions: [
        {
          id: 'rooflightsCount',
          title: 'How many rooflights?',
          helpText: 'Select the number of rooflights',
          type: 'cardGrid',
          required: true,
          options: [
            {
              id: '0',
              label: '0',
              icon: 'Home',
              value: 0,
              description: 'No rooflights',
            },
            {
              id: '1',
              label: '1',
              icon: 'Home',
              value: 1,
              description: 'One rooflight',
            },
            {
              id: '2',
              label: '2',
              icon: 'Home',
              value: 2,
              description: 'Two rooflights',
            },
            {
              id: '3',
              label: '3',
              icon: 'Home',
              value: 3,
              description: 'Three rooflights',
            },
            {
              id: '4-plus',
              label: '4+',
              icon: 'Home',
              value: 4,
              description: 'Four or more rooflights',
            },
          ],
        },
      ],
    },
    {
      id: 'step-9',
      title: 'Foundations Type',
      description: 'What type of foundations?',
      questions: [
        {
          id: 'foundationsType',
          title: 'What type of foundations?',
          helpText: 'Select the foundations type',
          type: 'cardGrid',
          required: true,
          options: [
            {
              id: 'standard-strip',
              label: 'Standard Strip',
              icon: 'Home',
              value: 'standard-strip',
              description: 'Standard strip foundations',
            },
            {
              id: 'trench-fill',
              label: 'Trench Fill',
              icon: 'Home',
              value: 'trench-fill',
              description: 'Trench fill foundations',
            },
            {
              id: 'piled',
              label: 'Piled (Provisional Sum)',
              icon: 'Home',
              value: 'piled',
              description: 'Piled foundations - provisional sum',
            },
            {
              id: 'unknown',
              label: 'Unknown (Provisional Sum)',
              icon: 'FileQuestion',
              value: 'unknown',
              description: 'Unknown - provisional sum',
            },
          ],
        },
      ],
    },
    {
      id: 'step-10',
      title: 'Heating Approach',
      description: 'How will heating be provided?',
      questions: [
        {
          id: 'heatingType',
          title: 'How will heating be provided?',
          helpText: 'Select the heating approach',
          type: 'cardGrid',
          required: true,
          options: [
            {
              id: 'extend-radiators',
              label: 'Extend Radiators',
              icon: 'Home',
              value: 'extend-radiators',
              description: 'Extend existing radiator system',
            },
            {
              id: 'wet-ufh',
              label: 'Wet UFH',
              icon: 'Home',
              value: 'wet-ufh',
              description: 'Wet underfloor heating',
            },
            {
              id: 'electric-ufh',
              label: 'Electric UFH',
              icon: 'Home',
              value: 'electric-ufh',
              description: 'Electric underfloor heating',
            },
            {
              id: 'none-existing',
              label: 'None/Existing',
              icon: 'Home',
              value: 'none-existing',
              description: 'No new heating or use existing',
            },
          ],
        },
      ],
    },
    {
      id: 'step-11',
      title: 'Electrics Specification',
      description: 'What level of electrical specification?',
      questions: [
        {
          id: 'electricsLevel',
          title: 'What level of electrical specification?',
          helpText: 'Select the electrical specification level',
          type: 'cardGrid',
          required: true,
          options: [
            {
              id: 'basic',
              label: 'Basic',
              icon: 'Home',
              value: 'basic',
              description: 'Basic electrical installation',
            },
            {
              id: 'standard',
              label: 'Standard',
              icon: 'Home',
              value: 'standard',
              description: 'Standard electrical installation',
            },
            {
              id: 'high-spec',
              label: 'High Spec',
              icon: 'Home',
              value: 'high-spec',
              description: 'High specification electrical installation',
            },
          ],
        },
      ],
    },
  ],
  promptBuilder: (answers: Record<string, any>) => {
    return buildEstimateBrief('single-storey-extension', answers);
  },
};

// Additional templates (stubs for now - can be expanded)
const doubleStoreyExtensionTemplate: EstimateBuilderTemplate = {
  id: 'double-storey-extension',
  name: 'Double Storey Extension',
  description: 'Two-storey extension',
  category: 'extension',
  icon: 'Building2',
  steps: [],
  promptBuilder: (answers) => buildEstimateBrief('double-storey-extension', answers),
};

const wraparoundExtensionTemplate: EstimateBuilderTemplate = {
  id: 'wraparound-extension',
  name: 'Wraparound Single Storey Extension',
  description: 'Single storey extension wrapping around a corner',
  category: 'extension',
  icon: 'Layers',
  steps: [],
  promptBuilder: (answers) => buildEstimateBrief('wraparound-extension', answers),
};

const combinationExtensionTemplate: EstimateBuilderTemplate = {
  id: 'combination-extension',
  name: 'Combination (Single + Double)',
  description: 'Combination of single and double storey extensions',
  category: 'extension',
  icon: 'Building2',
  steps: [],
  promptBuilder: (answers) => buildEstimateBrief('combination-extension', answers),
};

const loftConversionTemplate: EstimateBuilderTemplate = {
  id: 'loft-conversion',
  name: 'Loft Conversion',
  description: 'Convert loft space into living accommodation',
  category: 'conversion',
  icon: 'Home',
  steps: [],
  promptBuilder: (answers) => buildEstimateBrief('loft-conversion', answers),
};

const garageConversionTemplate: EstimateBuilderTemplate = {
  id: 'garage-conversion',
  name: 'Garage Conversion',
  description: 'Convert garage into living space',
  category: 'conversion',
  icon: 'Car',
  steps: [],
  promptBuilder: (answers) => buildEstimateBrief('garage-conversion', answers),
};

const kitchenRefurbishmentTemplate: EstimateBuilderTemplate = {
  id: 'kitchen-refurbishment',
  name: 'Kitchen Refurbishment',
  description: 'Kitchen renovation and refurbishment',
  category: 'refurbishment',
  icon: 'ChefHat',
  steps: [],
  promptBuilder: (answers) => buildEstimateBrief('kitchen-refurbishment', answers),
};

const bathroomRefurbishmentTemplate: EstimateBuilderTemplate = {
  id: 'bathroom-refurbishment',
  name: 'Bathroom Refurbishment',
  description: 'Bathroom renovation and refurbishment',
  category: 'refurbishment',
  icon: 'Bath',
  steps: [],
  promptBuilder: (answers) => buildEstimateBrief('bathroom-refurbishment', answers),
};

const generalRefurbishmentTemplate: EstimateBuilderTemplate = {
  id: 'general-refurbishment',
  name: 'General Refurbishment',
  description: 'General property refurbishment work',
  category: 'refurbishment',
  icon: 'Wrench',
  steps: [],
  promptBuilder: (answers) => buildEstimateBrief('general-refurbishment', answers),
};

const customTemplate: EstimateBuilderTemplate = {
  id: 'custom',
  name: 'Other (Custom)',
  description: 'Custom project template',
  category: 'other',
  icon: 'FileQuestion',
  steps: [],
  promptBuilder: (answers) => buildEstimateBrief('custom', answers),
};

export const templateRegistry: EstimateBuilderTemplate[] = [
  singleStoreyExtensionTemplate,
  doubleStoreyExtensionTemplate,
  wraparoundExtensionTemplate,
  combinationExtensionTemplate,
  loftConversionTemplate,
  garageConversionTemplate,
  kitchenRefurbishmentTemplate,
  bathroomRefurbishmentTemplate,
  generalRefurbishmentTemplate,
  customTemplate,
];

export function getTemplateById(id: string): EstimateBuilderTemplate | undefined {
  return templateRegistry.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): EstimateBuilderTemplate[] {
  return templateRegistry.filter((t) => t.category === category);
}

