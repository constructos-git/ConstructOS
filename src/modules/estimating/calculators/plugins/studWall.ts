import type { CalculatorPlugin } from '../types';

export const studWallCalculator: CalculatorPlugin = {
  schema: {
    key: 'stud_wall',
    name: 'Stud Wall Calculator',
    description: 'Calculate materials for timber stud partition wall',
    category: 'Structural',
    tags: ['stud', 'wall', 'partition', 'timber'],
    fields: [
      { key: 'length_m', label: 'Wall length (m)', type: 'number', unit: 'm', min: 0, default: 0 },
      { key: 'height_m', label: 'Wall height (m)', type: 'number', unit: 'm', min: 0, default: 2.4 },
      { key: 'openings_count', label: 'Number of openings', type: 'number', unit: 'openings', min: 0, default: 0 },
    ],
  },
  compute(values) {
    const length = Number(values.length_m || 0);
    const height = Number(values.height_m || 2.4);
    const openings = Number(values.openings_count || 0);
    const area = length * height;
    const studSpacing = 0.6; // m
    const studs = Math.ceil(length / studSpacing) + 1; // +1 for end stud
    const topPlate = length;
    const bottomPlate = length;
    const noggins = Math.floor(height / 1.2) * length; // noggins every 1.2m
    const plasterboardArea = area - (openings * 1.5); // rough opening deduction

    return {
      lines: [
        {
          itemType: 'material',
          title: '2x4 Timber (C16)',
          description: 'Studs, plates, noggins',
          quantity: (studs * height) + topPlate + bottomPlate + noggins,
          unit: 'm',
          category: 'Timber',
          unitCostHint: 3.5,
        },
        {
          itemType: 'material',
          title: '12.5mm Plasterboard',
          description: `${plasterboardArea.toFixed(1)}m² (both sides)`,
          quantity: Math.ceil(plasterboardArea * 2),
          unit: 'm²',
          category: 'Plasterboard',
          unitCostHint: 4.8,
        },
        {
          itemType: 'material',
          title: 'Screws (6x100)',
          quantity: Math.ceil(area * 8),
          unit: 'pack',
          category: 'Fixings',
          unitCostHint: 8.5,
        },
        {
          itemType: 'labour',
          title: 'Carpenter',
          description: `Building ${length.toFixed(1)}m stud wall`,
          quantity: length * 0.5,
          unit: 'hour',
          category: 'Structural',
          unitCostHint: 25,
        },
        {
          itemType: 'labour',
          title: 'Plasterboard Fixer',
          description: `Fixing ${plasterboardArea.toFixed(1)}m²`,
          quantity: plasterboardArea * 0.15,
          unit: 'hour',
          category: 'Finishing',
          unitCostHint: 20,
        },
      ],
      notes: [`Stud spacing: ${studSpacing}m`, `Total area: ${area.toFixed(1)}m²`],
    };
  },
};

