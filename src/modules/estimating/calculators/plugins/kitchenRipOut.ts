import type { CalculatorPlugin } from '../types';

export const kitchenRipOutCalculator: CalculatorPlugin = {
  schema: {
    key: 'kitchen_rip_out',
    name: 'Kitchen Rip Out Calculator',
    description: 'Calculate labour and skip for kitchen removal',
    category: 'Demolition',
    tags: ['kitchen', 'rip-out', 'demolition'],
    fields: [
      { key: 'kitchen_size', label: 'Kitchen size', type: 'select', options: [
        { label: 'Small (up to 3m)', value: 'small' },
        { label: 'Medium (3-5m)', value: 'medium' },
        { label: 'Large (5m+)', value: 'large' },
      ], default: 'medium' },
    ],
  },
  compute(values) {
    const size = values.kitchen_size || 'medium';
    const hours = size === 'small' ? 4 : size === 'medium' ? 6 : 8;
    const skipSize = size === 'small' ? 4 : size === 'medium' ? 6 : 8;

    return {
      lines: [
        {
          itemType: 'labour',
          title: 'Labourer',
          description: `Kitchen rip out (${size})`,
          quantity: hours,
          unit: 'hour',
          category: 'Demolition',
          unitCostHint: 15,
        },
        {
          itemType: 'plant',
          title: `Skip (${skipSize} yard)`,
          quantity: 1,
          unit: 'day',
          category: 'Plant',
          unitCostHint: 120,
        },
      ],
      notes: [`Estimated time: ${hours} hours`],
    };
  },
};

