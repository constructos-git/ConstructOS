import type { CalculatorPlugin } from '../types';

export const paintCalculator: CalculatorPlugin = {
  schema: {
    key: 'paint',
    name: 'Paint Calculator',
    description: 'Calculate paint and materials for walls/ceilings',
    category: 'Finishing',
    tags: ['paint', 'decorating', 'walls'],
    fields: [
      { key: 'area_m2', label: 'Area (m²)', type: 'number', unit: 'm²', min: 0, default: 0 },
      { key: 'coats', label: 'Number of coats', type: 'number', unit: 'coats', min: 1, default: 2 },
      { key: 'surface_type', label: 'Surface type', type: 'select', options: [
        { label: 'Plaster (new)', value: 'plaster_new' },
        { label: 'Plaster (existing)', value: 'plaster_existing' },
        { label: 'Wood', value: 'wood' },
        { label: 'Metal', value: 'metal' },
      ], default: 'plaster_existing' },
    ],
  },
  compute(values) {
    const area = Number(values.area_m2 || 0);
    const coats = Number(values.coats || 2);
    const coveragePerLitre = 12; // m² per litre (typical)
    const totalCoverage = area * coats;
    const paintLitres = Math.ceil(totalCoverage / coveragePerLitre);
    const primerLitres = values.surface_type === 'plaster_new' ? Math.ceil(area / coveragePerLitre) : 0;

    return {
      lines: [
        {
          itemType: 'material',
          title: 'Emulsion Paint',
          description: `${coats} coats`,
          quantity: paintLitres,
          unit: 'litre',
          category: 'Paint',
          unitCostHint: 15,
        },
        ...(primerLitres > 0 ? [{
          itemType: 'material',
          title: 'Primer/Undercoat',
          quantity: primerLitres,
          unit: 'litre',
          category: 'Paint',
          unitCostHint: 12,
        }] : []),
        {
          itemType: 'material',
          title: 'Paint Brushes',
          quantity: 2,
          unit: 'pack',
          category: 'Tools',
          unitCostHint: 8,
        },
        {
          itemType: 'material',
          title: 'Roller Sleeves',
          quantity: 3,
          unit: 'pack',
          category: 'Tools',
          unitCostHint: 5,
        },
        {
          itemType: 'labour',
          title: 'Painter',
          description: `Painting ${area.toFixed(1)}m²`,
          quantity: area * 0.15, // hours per m²
          unit: 'hour',
          category: 'Finishing',
          unitCostHint: 18,
        },
      ],
      notes: [`Coverage: ${coveragePerLitre}m² per litre`, `Total paint needed: ${paintLitres}L`],
    };
  },
};

