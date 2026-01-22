// Template Registry: Seed templates and schema definitions

import type {
  EstimateBuilderTemplate,
} from './types';
import { buildEstimateBrief } from './briefBuilder';

// Single Storey Extension Template (FULLY IMPLEMENTED)
const singleStoreyExtensionTemplate: EstimateBuilderTemplate = {
  id: 'single-storey-extension',
  name: 'Single Storey Extension',
  description: 'Standard single storey extension with configurable roof options',
  category: 'extension',
  icon: 'Home',
  steps: [
    {
      id: 'step-0',
      title: 'Property Type',
      description: 'What best describes the existing property?',
      questions: [
        {
          id: 'propertyType',
          title: 'What best describes the existing property?',
          helpText: 'Select the type of existing property',
          type: 'cardGrid',
          required: true,
          options: [
            {
              id: 'detached',
              label: 'Detached',
              icon: 'Home',
              value: 'detached',
              description: 'Standalone property',
            },
            {
              id: 'semi-detached',
              label: 'Semi Detached',
              icon: 'Building2',
              value: 'semi-detached',
              description: 'Two properties joined together',
            },
            {
              id: 'end-of-terrace',
              label: 'End of Terrace',
              icon: 'Home',
              value: 'end-of-terrace',
              description: 'End property in a row',
            },
            {
              id: 'terrace',
              label: 'Terrace',
              icon: 'Building2',
              value: 'terrace',
              description: 'Middle property in a row',
            },
            {
              id: 'flat',
              label: 'Flat',
              icon: 'Home',
              value: 'flat',
              description: 'Apartment or flat',
            },
            {
              id: 'bungalow',
              label: 'Bungalow',
              icon: 'Home',
              value: 'bungalow',
              description: 'Single storey property',
            },
          ],
        },
      ],
    },
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
      id: 'step-professional-services',
      title: 'Professional Services',
      description: 'Select required professional services and fees',
      questions: [], // Handled by ProfessionalServicesModal
    },
    {
      id: 'step-dimensions',
      title: 'Dimensions',
      description: 'Enter the basic extension dimensions',
      questions: [], // Dimensions handled by DimensionsBlock component
    },
    {
      id: 'step-foundations',
      title: 'Foundations',
      description: 'Select foundation type and dimensions',
      questions: [], // Handled by FoundationsModal
    },
    {
      id: 'step-ground-floor',
      title: 'Ground Floor Construction',
      description: 'Select ground floor type and construction method',
      questions: [], // Handled by GroundFloorModal
    },
    {
      id: 'step-wall-construction',
      title: 'Wall Construction',
      description: 'Select wall construction type, cavity details, and insulation',
      questions: [], // Handled by WallConstructionModal
    },
    {
      id: 'step-2',
      title: 'Knock-Through',
      description: 'Is a knock-through required?',
      questions: [], // Handled by KnockThroughModal
    },
    {
      id: 'step-3',
      title: 'Knock-Through Type',
      description: 'What type of knock-through?',
      questions: [], // Handled by KnockThroughModal
    },
    {
      id: 'step-steels-structural',
      title: 'Structural - Steels and Lintels',
      description: 'Specify steels and lintels for knock-through and the rest of the project',
      questions: [], // Handled by StructuralSteelsModal
    },
    {
      id: 'step-4',
      title: 'Roof Type',
      description: 'What type of roof?',
      questions: [], // Handled by RoofTypeModal
    },
    {
      id: 'step-5',
      title: 'Roof Coverings',
      description: 'What roof covering?',
      questions: [], // Handled by RoofCoveringsModal
    },
    {
      id: 'step-insulation',
      title: 'Insulation',
      description: 'Select insulation requirements',
      questions: [], // Handled by InsulationModal
    },
    {
      id: 'step-fascia-soffit-rainwater',
      title: 'Fascia, Soffit & Rainwater Goods',
      description: 'Specify fascia, soffit, roof overhangs, and rainwater goods',
      questions: [], // Handled by FasciaSoffitRainwaterModal
    },
    {
      id: 'step-6',
      title: 'External Wall Finish',
      description: 'What finish for the external walls?',
      questions: [], // Handled by ExternalWallFinishModal
    },
    {
      id: 'step-7',
      title: 'Rear Opening/Doors',
      description: 'What type of doors for the rear opening?',
      questions: [], // Handled by DoorsModal
    },
    {
      id: 'step-8',
      title: 'Rooflights',
      description: 'How many rooflights?',
      questions: [], // Handled by RooflightsModal
    },
    {
      id: 'step-10',
      title: 'Heating Approach',
      description: 'How will heating be provided?',
      questions: [], // Handled by HeatingModal
    },
    {
      id: 'step-11',
      title: 'Electrics Specification',
      description: 'What level of electrical specification?',
      questions: [], // Handled by ElectricsModal
    },
    {
      id: 'step-measurements',
      title: 'Measurements',
      description: 'Review and adjust detailed measurements',
      questions: [], // Measurements handled by MeasurementsBlock component
    },
    {
      id: 'step-0',
      title: 'Property Type',
      description: 'What best describes the existing property?',
      questions: [
        {
          id: 'propertyType',
          title: 'What best describes the existing property?',
          helpText: 'Select the type of existing property',
          type: 'cardGrid',
          required: true,
          options: [
            {
              id: 'detached',
              label: 'Detached',
              icon: 'Home',
              value: 'detached',
              description: 'Standalone property',
            },
            {
              id: 'semi-detached',
              label: 'Semi Detached',
              icon: 'Building2',
              value: 'semi-detached',
              description: 'Two properties joined together',
            },
            {
              id: 'end-of-terrace',
              label: 'End of Terrace',
              icon: 'Home',
              value: 'end-of-terrace',
              description: 'End property in a row',
            },
            {
              id: 'terrace',
              label: 'Terrace',
              icon: 'Building2',
              value: 'terrace',
              description: 'Middle property in a row',
            },
            {
              id: 'flat',
              label: 'Flat',
              icon: 'Home',
              value: 'flat',
              description: 'Apartment or flat',
            },
            {
              id: 'bungalow',
              label: 'Bungalow',
              icon: 'Home',
              value: 'bungalow',
              description: 'Single storey property',
            },
          ],
        },
      ],
    },
    {
      id: 'step-1',
      title: 'Location',
      description: 'Where is the extension being built?',
      questions: [
        {
          id: 'location',
          title: 'Where is the extension being built?',
          helpText: 'Select the location of the extension',
          type: 'cardGrid',
          required: true,
          options: [
            {
              id: 'rear',
              label: 'Rear',
              icon: 'Home',
              value: 'rear',
              description: 'Rear extension',
            },
            {
              id: 'side',
              label: 'Side',
              icon: 'Home',
              value: 'side',
              description: 'Side extension',
            },
            {
              id: 'front',
              label: 'Front',
              icon: 'Home',
              value: 'front',
              description: 'Front extension',
            },
            {
              id: 'wrap-around',
              label: 'Wrap Around',
              icon: 'Home',
              value: 'wrap-around',
              description: 'Wrap around extension',
            },
          ],
        },
      ],
    },
    {
      id: 'step-site-conditions',
      title: 'Site Conditions and Access',
      description: 'Configure site access, constraints, existing services, and ground conditions',
      questions: [], // Handled by SiteConditionsModal
    },
    {
      id: 'step-scaffolding',
      title: 'Scaffolding',
      description: 'Configure scaffolding requirements',
      questions: [], // Handled by ScaffoldingModal
    },
    {
      id: 'step-health-safety-welfare',
      title: 'Health & Safety & Welfare',
      description: 'Configure health, safety, and welfare provisions',
      questions: [], // Handled by HealthSafetyWelfareModal
    },
    {
      id: 'step-dimensions',
      title: 'Dimensions',
      description: 'Enter the basic extension dimensions',
      questions: [], // Dimensions handled by DimensionsBlock component
    },
    {
      id: 'step-foundations',
      title: 'Foundations',
      description: 'Select foundation type and dimensions',
      questions: [], // Handled by FoundationsModal
    },
    {
      id: 'step-ground-floor',
      title: 'Ground Floor Construction',
      description: 'Select ground floor type and construction method',
      questions: [], // Handled by GroundFloorModal
    },
    {
      id: 'step-2',
      title: 'Knock-Through',
      description: 'Is a knock-through required?',
      questions: [], // Handled by KnockThroughModal
    },
    {
      id: 'step-3',
      title: 'Knock-Through Type',
      description: 'What type of knock-through?',
      questions: [], // Handled by KnockThroughModal
    },
    {
      id: 'step-steels-structural',
      title: 'Structural - Steels and Lintels',
      description: 'Specify steels and lintels for knock-through and the rest of the project',
      questions: [], // Handled by StructuralSteelsModal
    },
    {
      id: 'step-4',
      title: 'Roof Type',
      description: 'What type of roof?',
      questions: [], // Handled by RoofTypeModal
    },
    {
      id: 'step-5',
      title: 'Roof Coverings',
      description: 'What roof covering?',
      questions: [], // Handled by RoofCoveringsModal
    },
    {
      id: 'step-insulation',
      title: 'Insulation',
      description: 'Select insulation requirements',
      questions: [], // Handled by InsulationModal
    },
    {
      id: 'step-fascia-soffit-rainwater',
      title: 'Fascia, Soffit & Rainwater Goods',
      description: 'Specify fascia, soffit, roof overhangs, and rainwater goods',
      questions: [], // Handled by FasciaSoffitRainwaterModal
    },
    {
      id: 'step-wall-construction',
      title: 'Wall Construction',
      description: 'Select wall construction type, cavity details, and insulation',
      questions: [], // Handled by WallConstructionModal
    },
    {
      id: 'step-6',
      title: 'External Wall Finish',
      description: 'What finish for the external walls?',
      questions: [], // Handled by ExternalWallFinishModal
    },
    {
      id: 'step-7',
      title: 'Rear Opening/Doors',
      description: 'What type of doors for the rear opening?',
      questions: [], // Handled by DoorsModal
    },
    {
      id: 'step-8',
      title: 'Rooflights',
      description: 'How many rooflights?',
      questions: [], // Handled by RooflightsModal
    },
    {
      id: 'step-10',
      title: 'Heating Approach',
      description: 'How will heating be provided?',
      questions: [], // Handled by HeatingModal
    },
    {
      id: 'step-11',
      title: 'Electrics Specification',
      description: 'What level of electrical specification?',
      questions: [], // Handled by ElectricsModal
    },
    {
      id: 'step-measurements',
      title: 'Measurements',
      description: 'Review and adjust detailed measurements',
      questions: [], // Measurements handled by MeasurementsBlock component
    },
  ],
  promptBuilder: (answers: Record<string, unknown>) => {
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

