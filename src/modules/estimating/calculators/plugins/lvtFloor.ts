import type { CalculatorPlugin } from '../types';

export const lvtFloorCalculator: CalculatorPlugin = {
  schema: {
    key: 'lvt_floor',
    name: 'LVT Floor Calculator',
    description: 'Calculate LVT flooring materials and installation',
    category: 'Flooring',
    tags: ['lvt', 'flooring', 'vinyl'],
    fields: [
      { key: 'area_m2', label: 'Floor area (m²)', type: 'number', unit: 'm²', min: 0, default: 0 },
      { key: 'waste_pct', label: 'Waste percentage', type: 'number', unit: '%', min: 0, default: 10 },
    ],
  },
  compute(values) {
    const area = Number(values.area_m2 || 0);
    const waste = Number(values.waste_pct || 10) / 100;
    const totalArea = area * (1 + waste);
    const packSize = 2.5; // m² per pack (typical)
    const packs = Math.ceil(totalArea / packSize);

    return {
      lines: [
        {
          itemType: 'material',
          title: 'LVT Flooring',
          description: `${area.toFixed(1)}m² + ${(waste * 100).toFixed(0)}% waste`,
          quantity: packs,
          unit: 'pack',
          category: 'Flooring',
          unitCostHint: 25,
        },
        {
          itemType: 'material',
          title: 'LVT Adhesive',
          quantity: Math.ceil(area / 10),
          unit: 'litre',
          category: 'Adhesive',
          unitCostHint: 8,
        },
        {
          itemType: 'material',
          title: 'Underlay (if required)',
          quantity: Math.ceil(area),
          unit: 'm²',
          category: 'Flooring',
          unitCostHint: 3,
        },
        {
          itemType: 'labour',
          title: 'Flooring Installer',
          description: `Installing ${area.toFixed(1)}m²`,
          quantity: area * 0.3,
          unit: 'hour',
          category: 'Flooring',
          unitCostHint: 22,
        },
      ],
      notes: [`Pack size: ${packSize}m²`, `Total packs needed: ${packs}`],
    };
  },
};

