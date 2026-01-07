import type { CalculatorPlugin } from '../types';

export const plasterboardCalculator: CalculatorPlugin = {
  schema: {
    key: 'plasterboard',
    name: 'Plasterboard Calculator',
    description: 'Calculate plasterboard and fixings',
    category: 'Finishing',
    tags: ['plasterboard', 'drywall', 'walls'],
    fields: [
      { key: 'area_m2', label: 'Area (m²)', type: 'number', unit: 'm²', min: 0, default: 0 },
      { key: 'thickness', label: 'Thickness', type: 'select', options: [
        { label: '12.5mm', value: '12.5' },
        { label: '15mm', value: '15' },
      ], default: '12.5' },
    ],
  },
  compute(values) {
    const area = Number(values.area_m2 || 0);
    const thickness = values.thickness || '12.5';
    const boardSize = 2.88; // m² per board (2.4m x 1.2m)
    const boards = Math.ceil(area / boardSize);
    const screwsPerM2 = 12;

    return {
      lines: [
        {
          itemType: 'material',
          title: `${thickness}mm Plasterboard`,
          quantity: boards,
          unit: 'board',
          category: 'Plasterboard',
          unitCostHint: thickness === '15' ? 5.5 : 4.8,
        },
        {
          itemType: 'material',
          title: 'Screws (6x100)',
          quantity: Math.ceil(area * screwsPerM2 / 100),
          unit: 'pack',
          category: 'Fixings',
          unitCostHint: 8.5,
        },
        {
          itemType: 'labour',
          title: 'Plasterboard Fixer',
          description: `Fixing ${area.toFixed(1)}m²`,
          quantity: area * 0.15,
          unit: 'hour',
          category: 'Finishing',
          unitCostHint: 20,
        },
      ],
      notes: [`Board size: ${boardSize}m²`, `Total boards: ${boards}`],
    };
  },
};

