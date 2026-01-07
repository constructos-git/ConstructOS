import type { CalculatorPlugin } from '../types';

export const roofingFeltTilesCalculator: CalculatorPlugin = {
  schema: {
    key: 'roofing_felt_tiles',
    name: 'Roofing Felt & Tiles Calculator',
    description: 'Calculate roofing materials',
    category: 'Roofing',
    tags: ['roofing', 'tiles', 'felt'],
    fields: [
      { key: 'roof_area_m2', label: 'Roof area (m²)', type: 'number', unit: 'm²', min: 0, default: 0 },
      { key: 'pitch_degrees', label: 'Roof pitch (degrees)', type: 'number', unit: '°', min: 0, default: 35 },
    ],
  },
  compute(values) {
    const area = Number(values.roof_area_m2 || 0);
    const pitch = Number(values.pitch_degrees || 35);
    const waste = 0.15; // 15% waste
    const totalArea = area * (1 + waste);
    const tilesPerM2 = 10; // typical
    const tiles = Math.ceil(totalArea * tilesPerM2);
    const feltRolls = Math.ceil(totalArea / 10); // 10m² per roll

    return {
      lines: [
        {
          itemType: 'material',
          title: 'Roof Tiles',
          description: `${area.toFixed(1)}m² + 15% waste`,
          quantity: tiles,
          unit: 'tile',
          category: 'Roofing',
          unitCostHint: 1.2,
        },
        {
          itemType: 'material',
          title: 'Roofing Felt',
          quantity: feltRolls,
          unit: 'roll',
          category: 'Roofing',
          unitCostHint: 45,
        },
        {
          itemType: 'material',
          title: 'Battens',
          quantity: Math.ceil(area * 3),
          unit: 'm',
          category: 'Timber',
          unitCostHint: 2.5,
        },
        {
          itemType: 'labour',
          title: 'Roofer',
          description: `Installing ${area.toFixed(1)}m² roof`,
          quantity: area * 0.5,
          unit: 'hour',
          category: 'Roofing',
          unitCostHint: 26,
        },
      ],
      notes: [`Pitch: ${pitch}°`, `Tiles per m²: ${tilesPerM2}`],
    };
  },
};

