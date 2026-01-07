import type { CalculatorPlugin } from '../types';

export const insulationCalculator: CalculatorPlugin = {
  schema: {
    key: 'insulation',
    name: 'Insulation Calculator',
    description: 'Calculate insulation materials',
    category: 'Insulation',
    tags: ['insulation', 'thermal', 'cavity'],
    fields: [
      { key: 'area_m2', label: 'Area (m²)', type: 'number', unit: 'm²', min: 0, default: 0 },
      { key: 'thickness_mm', label: 'Thickness (mm)', type: 'number', unit: 'mm', min: 0, default: 100 },
      { key: 'insulation_type', label: 'Type', type: 'select', options: [
        { label: 'Cavity Wall', value: 'cavity' },
        { label: 'Loft/Floor', value: 'loft' },
        { label: 'External Wall', value: 'external' },
      ], default: 'cavity' },
    ],
  },
  compute(values) {
    const area = Number(values.area_m2 || 0);
    const thickness = Number(values.thickness_mm || 100);
    const packSize = 5.76; // m² per pack (typical)
    const packs = Math.ceil(area / packSize);

    return {
      lines: [
        {
          itemType: 'material',
          title: `Cavity Insulation (${thickness}mm)`,
          quantity: packs,
          unit: 'pack',
          category: 'Insulation',
          unitCostHint: 12,
        },
        {
          itemType: 'labour',
          title: 'Insulation Installer',
          description: `Installing ${area.toFixed(1)}m²`,
          quantity: area * 0.1,
          unit: 'hour',
          category: 'Insulation',
          unitCostHint: 18,
        },
      ],
      notes: [`Pack size: ${packSize}m²`, `Total packs: ${packs}`],
    };
  },
};

