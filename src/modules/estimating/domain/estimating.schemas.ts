export type EstimateItemType = 'labour' | 'material' | 'plant' | 'subcontract' | 'combined';

export type CalculatorFieldType = 'number' | 'text' | 'select' | 'boolean';

export interface CalculatorField {
  key: string;
  label: string;
  type: CalculatorFieldType;
  unit?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
  defaultValue?: any;
  help?: string;
}

export interface CalculatorSchema {
  version: number;
  fields: CalculatorField[];
}

export interface CalculatorOutput {
  version: number;
  assemblyId: string;          // which assembly to instantiate
  variables: string[];         // e.g. ["area","thickness","length","height","openingsArea"]
  notes?: string;
}

