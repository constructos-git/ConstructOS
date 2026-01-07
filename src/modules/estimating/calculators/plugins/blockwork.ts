import type { CalculatorPlugin } from '../types';

export const blockworkCalculator: CalculatorPlugin = {
  schema: {
    key: 'blockwork',
    name: 'Blockwork Calculator',
    description: 'Calculate blocks and mortar for block wall',
    category: 'Structural',
    tags: ['blocks', 'masonry', 'wall'],
    fields: [
      { key: 'length_m', label: 'Wall length (m)', type: 'number', unit: 'm', min: 0, default: 0 },
      { key: 'height_m', label: 'Wall height (m)', type: 'number', unit: 'm', min: 0, default: 2.4 },
      { key: 'block_type', label: 'Block type', type: 'select', options: [
        { label: '100mm Standard', value: '100mm' },
        { label: '140mm Standard', value: '140mm' },
        { label: '215mm Standard', value: '215mm' },
      ], default: '100mm' },
    ],
  },
  compute(values) {
    const length = Number(values.length_m || 0);
    const height = Number(values.height_m || 2.4);
    const area = length * height;
    const blocksPerM2 = 10; // typical
    const blocks = Math.ceil(area * blocksPerM2);
    const mortarPerM2 = 0.02; // m³ per m²
    const mortarM3 = area * mortarPerM2;
    const cementBags = Math.ceil(mortarM3 * 6); // bags per m³
    const sandTonne = mortarM3 * 1.5; // tonne per m³

    return {
      lines: [
        {
          itemType: 'material',
          title: `Concrete Blocks (${values.block_type || '100mm'})`,
          quantity: blocks,
          unit: 'each',
          category: 'Blocks',
          unitCostHint: 0.85,
        },
        {
          itemType: 'material',
          title: 'Cement',
          quantity: cementBags,
          unit: 'bag',
          category: 'Mortar',
          unitCostHint: 6.5,
        },
        {
          itemType: 'material',
          title: 'Sharp Sand',
          quantity: Math.ceil(sandTonne * 10) / 10,
          unit: 'tonne',
          category: 'Mortar',
          unitCostHint: 45,
        },
        {
          itemType: 'labour',
          title: 'Bricklayer',
          description: `Building ${area.toFixed(1)}m² block wall`,
          quantity: area * 0.4,
          unit: 'hour',
          category: 'Structural',
          unitCostHint: 22,
        },
      ],
      notes: [`Blocks per m²: ${blocksPerM2}`, `Mortar: ${mortarM3.toFixed(2)}m³`],
    };
  },
};

