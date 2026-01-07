import type { CalculatorPlugin } from '../types';

export const plasterSkimCalculator: CalculatorPlugin = {
  schema: {
    key: 'plaster_skim',
    name: 'Plaster Skim Calculator',
    description: 'Calculate materials and labour for plaster skimming',
    category: 'Finishing',
    tags: ['plaster', 'skim', 'walls'],
    fields: [
      { key: 'area_m2', label: 'Wall area (m²)', type: 'number', unit: 'm²', min: 0, default: 0 },
      { key: 'ceiling_area_m2', label: 'Ceiling area (m²)', type: 'number', unit: 'm²', min: 0, default: 0 },
    ],
  },
  compute(values) {
    const wallArea = Number(values.area_m2 || 0);
    const ceilingArea = Number(values.ceiling_area_m2 || 0);
    const totalArea = wallArea + ceilingArea;
    const coveragePerBag = 10; // m² per bag (typical)
    const bags = Math.ceil(totalArea / coveragePerBag);
    const hours = totalArea * 0.2; // hours per m²

    return {
      lines: [
        {
          itemType: 'material',
          title: 'Plaster Skim',
          description: `${totalArea.toFixed(1)}m² total`,
          quantity: bags,
          unit: 'bag',
          category: 'Plaster',
          unitCostHint: 12,
        },
        {
          itemType: 'material',
          title: 'PVA Bonding Agent',
          quantity: Math.ceil(totalArea / 20),
          unit: 'litre',
          category: 'Adhesive',
          unitCostHint: 8,
        },
        {
          itemType: 'labour',
          title: 'Plasterer',
          description: `Skimming ${totalArea.toFixed(1)}m²`,
          quantity: hours,
          unit: 'hour',
          category: 'Finishing',
          unitCostHint: 24,
        },
      ],
      notes: [`Coverage: ${coveragePerBag}m² per bag`, `Estimated time: ${hours.toFixed(1)} hours`],
    };
  },
};

