export type CalcField =
  | { key: string; label: string; type: 'number'; unit?: string; min?: number; default?: number; }
  | { key: string; label: string; type: 'select'; options: Array<{ label: string; value: string }>; default?: string; };

export type CalcSchema = {
  key: string;
  name: string;
  description?: string;
  category: string;
  tags?: string[];
  fields: CalcField[];
};

export type CalcResultLine = {
  itemType: 'material' | 'labour' | 'plant' | 'subcontract';
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  category?: string;
  unitCostHint?: number; // optional, filled by rate book later
};

export type CalculatorPlugin = {
  schema: CalcSchema;
  compute: (values: Record<string, any>) => { lines: CalcResultLine[]; notes?: string[] };
};

