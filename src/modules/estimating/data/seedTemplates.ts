import { estimateTemplatesRepo } from './templates.repo';

export interface TemplateSeed {
  name: string;
  description: string;
  category: string;
  template_type: 'extension' | 'conversion' | 'refurbishment' | 'standard';
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_hours: number;
  typical_price_range: { min: number; max: number };
  visual_config: {
    planView: {
      defaultDimensions: { width: number; depth: number; height: number };
    };
    roofOptions: {
      availableStyles: string[];
      defaultStyle: string;
      ridgeDirections: string[];
      defaultRidgeDirection: string;
    };
    fasciaSoffit: {
      defaultFasciaHeightFlat: number;
      defaultSoffitDepthFlat: number;
      defaultFasciaHeightPitched: number;
      defaultSoffitDepthPitched: number;
    };
  };
  sections: Array<{
    title: string;
    items: Array<{
      item_type: string;
      title: string;
      description?: string;
      quantity: number;
      unit: string;
      unit_price: number;
    }>;
  }>;
}

export const seedTemplates: TemplateSeed[] = [
  {
    name: 'Single Storey Extension',
    description: 'Standard single storey rear extension with pitched roof',
    category: 'Extensions',
    template_type: 'extension',
    tags: ['extension', 'single-storey', 'rear', 'pitched-roof'],
    difficulty: 'intermediate',
    estimated_duration_hours: 2.5,
    typical_price_range: { min: 25000, max: 50000 },
    visual_config: {
      planView: {
        defaultDimensions: { width: 4, depth: 5, height: 2.4 },
      },
      roofOptions: {
        availableStyles: ['pitched', 'flat', 'hipped'],
        defaultStyle: 'pitched',
        ridgeDirections: ['north-south', 'east-west'],
        defaultRidgeDirection: 'north-south',
      },
      fasciaSoffit: {
        defaultFasciaHeightFlat: 250,
        defaultSoffitDepthFlat: 150,
        defaultFasciaHeightPitched: 250,
        defaultSoffitDepthPitched: 250,
      },
    },
    sections: [
      {
        title: 'Foundations',
        items: [
          { item_type: 'labour', title: 'Excavate foundations', quantity: 1, unit: 'm3', unit_price: 45.00 },
          { item_type: 'material', title: 'Concrete for foundations', quantity: 1, unit: 'm3', unit_price: 120.00 },
          { item_type: 'labour', title: 'Pour and level foundations', quantity: 1, unit: 'm3', unit_price: 35.00 },
        ],
      },
      {
        title: 'Walls',
        items: [
          { item_type: 'material', title: 'Blockwork', quantity: 1, unit: 'm2', unit_price: 25.00 },
          { item_type: 'labour', title: 'Build walls', quantity: 1, unit: 'm2', unit_price: 40.00 },
        ],
      },
      {
        title: 'Roof',
        items: [
          { item_type: 'material', title: 'Roof structure timber', quantity: 1, unit: 'm2', unit_price: 35.00 },
          { item_type: 'material', title: 'Roof tiles', quantity: 1, unit: 'm2', unit_price: 45.00 },
          { item_type: 'labour', title: 'Construct roof', quantity: 1, unit: 'm2', unit_price: 55.00 },
        ],
      },
    ],
  },
  {
    name: 'Double Storey Extension',
    description: 'Two-storey rear extension with pitched roof',
    category: 'Extensions',
    template_type: 'extension',
    tags: ['extension', 'double-storey', 'rear', 'pitched-roof'],
    difficulty: 'advanced',
    estimated_duration_hours: 4.0,
    typical_price_range: { min: 50000, max: 100000 },
    visual_config: {
      planView: {
        defaultDimensions: { width: 5, depth: 6, height: 5.5 },
      },
      roofOptions: {
        availableStyles: ['pitched', 'hipped'],
        defaultStyle: 'pitched',
        ridgeDirections: ['north-south', 'east-west'],
        defaultRidgeDirection: 'north-south',
      },
      fasciaSoffit: {
        defaultFasciaHeightFlat: 250,
        defaultSoffitDepthFlat: 150,
        defaultFasciaHeightPitched: 250,
        defaultSoffitDepthPitched: 250,
      },
    },
    sections: [
      {
        title: 'Foundations',
        items: [
          { item_type: 'labour', title: 'Excavate foundations', quantity: 1, unit: 'm3', unit_price: 45.00 },
          { item_type: 'material', title: 'Concrete for foundations', quantity: 1, unit: 'm3', unit_price: 120.00 },
        ],
      },
      {
        title: 'Ground Floor',
        items: [
          { item_type: 'material', title: 'Blockwork', quantity: 1, unit: 'm2', unit_price: 25.00 },
          { item_type: 'labour', title: 'Build walls', quantity: 1, unit: 'm2', unit_price: 40.00 },
        ],
      },
      {
        title: 'First Floor',
        items: [
          { item_type: 'material', title: 'Blockwork', quantity: 1, unit: 'm2', unit_price: 25.00 },
          { item_type: 'labour', title: 'Build walls', quantity: 1, unit: 'm2', unit_price: 40.00 },
        ],
      },
      {
        title: 'Roof',
        items: [
          { item_type: 'material', title: 'Roof structure timber', quantity: 1, unit: 'm2', unit_price: 35.00 },
          { item_type: 'material', title: 'Roof tiles', quantity: 1, unit: 'm2', unit_price: 45.00 },
          { item_type: 'labour', title: 'Construct roof', quantity: 1, unit: 'm2', unit_price: 55.00 },
        ],
      },
    ],
  },
  {
    name: 'Single Storey Extension - Flat Roof',
    description: 'Single storey extension with flat roof',
    category: 'Extensions',
    template_type: 'extension',
    tags: ['extension', 'single-storey', 'flat-roof'],
    difficulty: 'beginner',
    estimated_duration_hours: 2.0,
    typical_price_range: { min: 20000, max: 40000 },
    visual_config: {
      planView: {
        defaultDimensions: { width: 4, depth: 5, height: 2.4 },
      },
      roofOptions: {
        availableStyles: ['flat'],
        defaultStyle: 'flat',
        ridgeDirections: [],
        defaultRidgeDirection: 'north-south',
      },
      fasciaSoffit: {
        defaultFasciaHeightFlat: 250,
        defaultSoffitDepthFlat: 150,
        defaultFasciaHeightPitched: 250,
        defaultSoffitDepthPitched: 250,
      },
    },
    sections: [
      {
        title: 'Foundations',
        items: [
          { item_type: 'labour', title: 'Excavate foundations', quantity: 1, unit: 'm3', unit_price: 45.00 },
          { item_type: 'material', title: 'Concrete for foundations', quantity: 1, unit: 'm3', unit_price: 120.00 },
        ],
      },
      {
        title: 'Walls',
        items: [
          { item_type: 'material', title: 'Blockwork', quantity: 1, unit: 'm2', unit_price: 25.00 },
          { item_type: 'labour', title: 'Build walls', quantity: 1, unit: 'm2', unit_price: 40.00 },
        ],
      },
      {
        title: 'Flat Roof',
        items: [
          { item_type: 'material', title: 'Flat roof structure', quantity: 1, unit: 'm2', unit_price: 50.00 },
          { item_type: 'material', title: 'EPDM or felt roofing', quantity: 1, unit: 'm2', unit_price: 35.00 },
          { item_type: 'labour', title: 'Install flat roof', quantity: 1, unit: 'm2', unit_price: 45.00 },
        ],
      },
    ],
  },
  {
    name: 'Loft Conversion',
    description: 'Standard loft conversion with dormer',
    category: 'Conversions',
    template_type: 'conversion',
    tags: ['loft', 'conversion', 'dormer'],
    difficulty: 'advanced',
    estimated_duration_hours: 5.0,
    typical_price_range: { min: 30000, max: 60000 },
    visual_config: {
      planView: {
        defaultDimensions: { width: 6, depth: 8, height: 2.4 },
      },
      roofOptions: {
        availableStyles: ['pitched', 'hipped'],
        defaultStyle: 'pitched',
        ridgeDirections: ['north-south', 'east-west'],
        defaultRidgeDirection: 'north-south',
      },
      fasciaSoffit: {
        defaultFasciaHeightFlat: 250,
        defaultSoffitDepthFlat: 150,
        defaultFasciaHeightPitched: 250,
        defaultSoffitDepthPitched: 250,
      },
    },
    sections: [
      {
        title: 'Structural',
        items: [
          { item_type: 'labour', title: 'Install steel beams', quantity: 1, unit: 'each', unit_price: 500.00 },
          { item_type: 'material', title: 'Steel beams', quantity: 1, unit: 'each', unit_price: 800.00 },
        ],
      },
      {
        title: 'Dormer',
        items: [
          { item_type: 'material', title: 'Dormer structure', quantity: 1, unit: 'm2', unit_price: 150.00 },
          { item_type: 'labour', title: 'Construct dormer', quantity: 1, unit: 'm2', unit_price: 120.00 },
        ],
      },
      {
        title: 'Internal Fit-out',
        items: [
          { item_type: 'material', title: 'Insulation', quantity: 1, unit: 'm2', unit_price: 25.00 },
          { item_type: 'material', title: 'Plasterboard', quantity: 1, unit: 'm2', unit_price: 12.00 },
          { item_type: 'labour', title: 'Plaster and finish', quantity: 1, unit: 'm2', unit_price: 18.00 },
        ],
      },
    ],
  },
  {
    name: 'Kitchen Refurbishment',
    description: 'Complete kitchen refurbishment including units, worktops, and appliances',
    category: 'Refurbishments',
    template_type: 'refurbishment',
    tags: ['kitchen', 'refurbishment', 'units'],
    difficulty: 'intermediate',
    estimated_duration_hours: 3.0,
    typical_price_range: { min: 10000, max: 30000 },
    visual_config: {
      planView: {
        defaultDimensions: { width: 4, depth: 3, height: 2.4 },
      },
      roofOptions: {
        availableStyles: [],
        defaultStyle: 'flat',
        ridgeDirections: [],
        defaultRidgeDirection: 'north-south',
      },
      fasciaSoffit: {
        defaultFasciaHeightFlat: 250,
        defaultSoffitDepthFlat: 150,
        defaultFasciaHeightPitched: 250,
        defaultSoffitDepthPitched: 250,
      },
    },
    sections: [
      {
        title: 'Demolition',
        items: [
          { item_type: 'labour', title: 'Remove old kitchen', quantity: 1, unit: 'each', unit_price: 500.00 },
        ],
      },
      {
        title: 'Kitchen Units',
        items: [
          { item_type: 'material', title: 'Base units', quantity: 1, unit: 'each', unit_price: 200.00 },
          { item_type: 'material', title: 'Wall units', quantity: 1, unit: 'each', unit_price: 180.00 },
          { item_type: 'labour', title: 'Install units', quantity: 1, unit: 'each', unit_price: 100.00 },
        ],
      },
      {
        title: 'Worktops',
        items: [
          { item_type: 'material', title: 'Worktop', quantity: 1, unit: 'm', unit_price: 150.00 },
          { item_type: 'labour', title: 'Install worktop', quantity: 1, unit: 'm', unit_price: 80.00 },
        ],
      },
    ],
  },
  {
    name: 'Single Storey Irregular Shape Extension',
    description: 'Single storey extension with irregular/non-rectangular shape',
    category: 'Extensions',
    template_type: 'extension',
    tags: ['extension', 'single-storey', 'irregular', 'custom-shape'],
    difficulty: 'advanced',
    estimated_duration_hours: 3.5,
    typical_price_range: { min: 35000, max: 70000 },
    visual_config: {
      planView: {
        defaultDimensions: { width: 5, depth: 4, height: 2.4 },
      },
      roofOptions: {
        availableStyles: ['pitched', 'flat', 'hipped'],
        defaultStyle: 'pitched',
        ridgeDirections: ['north-south', 'east-west'],
        defaultRidgeDirection: 'north-south',
      },
      fasciaSoffit: {
        defaultFasciaHeightFlat: 250,
        defaultSoffitDepthFlat: 150,
        defaultFasciaHeightPitched: 250,
        defaultSoffitDepthPitched: 250,
      },
    },
    sections: [
      {
        title: 'Foundations',
        items: [
          { item_type: 'labour', title: 'Excavate foundations (irregular)', quantity: 1, unit: 'm3', unit_price: 50.00 },
          { item_type: 'material', title: 'Concrete for foundations', quantity: 1, unit: 'm3', unit_price: 120.00 },
        ],
      },
      {
        title: 'Walls',
        items: [
          { item_type: 'material', title: 'Blockwork (irregular)', quantity: 1, unit: 'm2', unit_price: 28.00 },
          { item_type: 'labour', title: 'Build walls (irregular)', quantity: 1, unit: 'm2', unit_price: 45.00 },
        ],
      },
      {
        title: 'Roof',
        items: [
          { item_type: 'material', title: 'Roof structure timber (irregular)', quantity: 1, unit: 'm2', unit_price: 40.00 },
          { item_type: 'material', title: 'Roof tiles', quantity: 1, unit: 'm2', unit_price: 45.00 },
          { item_type: 'labour', title: 'Construct roof (irregular)', quantity: 1, unit: 'm2', unit_price: 60.00 },
        ],
      },
    ],
  },
  {
    name: 'Single Storey Wraparound Extension',
    description: 'Single storey extension that wraps around a corner of the existing property',
    category: 'Extensions',
    template_type: 'extension',
    tags: ['extension', 'single-storey', 'wraparound', 'corner'],
    difficulty: 'advanced',
    estimated_duration_hours: 4.0,
    typical_price_range: { min: 40000, max: 80000 },
    visual_config: {
      planView: {
        defaultDimensions: { width: 6, depth: 5, height: 2.4 },
      },
      roofOptions: {
        availableStyles: ['pitched', 'hipped'],
        defaultStyle: 'pitched',
        ridgeDirections: ['north-south', 'east-west'],
        defaultRidgeDirection: 'north-south',
      },
      fasciaSoffit: {
        defaultFasciaHeightFlat: 250,
        defaultSoffitDepthFlat: 150,
        defaultFasciaHeightPitched: 250,
        defaultSoffitDepthPitched: 250,
      },
    },
    sections: [
      {
        title: 'Foundations',
        items: [
          { item_type: 'labour', title: 'Excavate foundations (wraparound)', quantity: 1, unit: 'm3', unit_price: 55.00 },
          { item_type: 'material', title: 'Concrete for foundations', quantity: 1, unit: 'm3', unit_price: 120.00 },
        ],
      },
      {
        title: 'Walls',
        items: [
          { item_type: 'material', title: 'Blockwork (wraparound)', quantity: 1, unit: 'm2', unit_price: 30.00 },
          { item_type: 'labour', title: 'Build walls (wraparound)', quantity: 1, unit: 'm2', unit_price: 50.00 },
        ],
      },
      {
        title: 'Roof',
        items: [
          { item_type: 'material', title: 'Roof structure timber (wraparound)', quantity: 1, unit: 'm2', unit_price: 42.00 },
          { item_type: 'material', title: 'Roof tiles', quantity: 1, unit: 'm2', unit_price: 45.00 },
          { item_type: 'labour', title: 'Construct roof (wraparound)', quantity: 1, unit: 'm2', unit_price: 65.00 },
        ],
      },
    ],
  },
  {
    name: 'Dual Combo Extension',
    description: 'Combination of double storey and single storey extensions',
    category: 'Extensions',
    template_type: 'extension',
    tags: ['extension', 'dual-combo', 'double-storey', 'single-storey', 'combination'],
    difficulty: 'advanced',
    estimated_duration_hours: 5.0,
    typical_price_range: { min: 75000, max: 150000 },
    visual_config: {
      planView: {
        defaultDimensions: { width: 6, depth: 5, height: 5.5 },
      },
      roofOptions: {
        availableStyles: ['pitched', 'hipped'],
        defaultStyle: 'pitched',
        ridgeDirections: ['north-south', 'east-west'],
        defaultRidgeDirection: 'north-south',
      },
      fasciaSoffit: {
        defaultFasciaHeightFlat: 250,
        defaultSoffitDepthFlat: 150,
        defaultFasciaHeightPitched: 250,
        defaultSoffitDepthPitched: 250,
      },
    },
    sections: [
      {
        title: 'Foundations',
        items: [
          { item_type: 'labour', title: 'Excavate foundations (dual combo)', quantity: 1, unit: 'm3', unit_price: 60.00 },
          { item_type: 'material', title: 'Concrete for foundations', quantity: 1, unit: 'm3', unit_price: 120.00 },
        ],
      },
      {
        title: 'Ground Floor (Single Storey Section)',
        items: [
          { item_type: 'material', title: 'Blockwork', quantity: 1, unit: 'm2', unit_price: 25.00 },
          { item_type: 'labour', title: 'Build walls', quantity: 1, unit: 'm2', unit_price: 40.00 },
        ],
      },
      {
        title: 'First Floor (Double Storey Section)',
        items: [
          { item_type: 'material', title: 'Blockwork', quantity: 1, unit: 'm2', unit_price: 25.00 },
          { item_type: 'labour', title: 'Build walls', quantity: 1, unit: 'm2', unit_price: 40.00 },
        ],
      },
      {
        title: 'Roof',
        items: [
          { item_type: 'material', title: 'Roof structure timber', quantity: 1, unit: 'm2', unit_price: 38.00 },
          { item_type: 'material', title: 'Roof tiles', quantity: 1, unit: 'm2', unit_price: 45.00 },
          { item_type: 'labour', title: 'Construct roof', quantity: 1, unit: 'm2', unit_price: 58.00 },
        ],
      },
    ],
  },
];

export async function seedTemplatesForCompany(companyId: string) {
  console.log(`🌱 Starting template seeding for company: ${companyId}`);
  let seededCount = 0;
  
  // Get all existing templates once
  const existingTemplates = await estimateTemplatesRepo.list(companyId);
  const existingNames = new Set(existingTemplates.map((t) => t.name));
  
  for (const templateSeed of seedTemplates) {
    try {
      // Check if template already exists
      if (existingNames.has(templateSeed.name)) {
        console.log(`⏭️  Template "${templateSeed.name}" already exists, skipping...`);
        continue;
      }

      console.log(`📝 Creating template: ${templateSeed.name}`);
      
      // Create template
      const template = await estimateTemplatesRepo.create(companyId, {
        name: templateSeed.name,
        description: templateSeed.description,
        category: templateSeed.category,
      });

      console.log(`✅ Created template ${template.id}, updating metadata...`);

      // Update with metadata (tags, difficulty, price range, visual_config, etc.)
      // Note: tags might be stored as text[] in DB, so we need to handle it properly
      const updatePayload: any = {
        template_type: templateSeed.template_type,
        difficulty: templateSeed.difficulty,
        estimated_duration_hours: templateSeed.estimated_duration_hours,
        typical_price_range: templateSeed.typical_price_range,
        visual_config: templateSeed.visual_config,
        typical_min: templateSeed.typical_price_range.min,
        typical_max: templateSeed.typical_price_range.max,
        typical_duration_days: Math.ceil(templateSeed.estimated_duration_hours / 8),
        is_featured: templateSeed.difficulty === 'beginner' || templateSeed.difficulty === 'intermediate',
      };
      
      // Handle tags - check if DB expects array or string
      // If tags column is text[], pass array; if text, join with comma
      updatePayload.tags = Array.isArray(templateSeed.tags) ? templateSeed.tags : templateSeed.tags;
      
      try {
        await estimateTemplatesRepo.update(companyId, template.id, updatePayload);
        console.log(`✅ Updated template metadata for: ${templateSeed.name}`);
      } catch (updateError) {
        console.error(`⚠️  Failed to update template metadata for "${templateSeed.name}":`, updateError);
        // Continue anyway - template was created, just metadata update failed
      }

      console.log(`📋 Creating ${templateSeed.sections.length} sections...`);

      // Create sections and items
      for (let sectionIndex = 0; sectionIndex < templateSeed.sections.length; sectionIndex++) {
        const sectionSeed = templateSeed.sections[sectionIndex];
        
        // Create section
        await estimateTemplatesRepo.createSection(companyId, template.id, {
          sort_order: sectionIndex,
          title: sectionSeed.title,
          is_client_visible: true,
        });

        // Create items for this section
        for (let itemIndex = 0; itemIndex < sectionSeed.items.length; itemIndex++) {
          const itemSeed = sectionSeed.items[itemIndex];
          await estimateTemplatesRepo.createItem(companyId, template.id, {
            template_section_sort_order: sectionIndex,
            sort_order: itemIndex,
            item_type: itemSeed.item_type,
            title: itemSeed.title,
            description: itemSeed.description,
            quantity: itemSeed.quantity,
            unit: itemSeed.unit,
            unit_price: itemSeed.unit_price,
            is_client_visible: true,
          });
        }
      }

      seededCount++;
      console.log(`✅ Successfully seeded template: ${templateSeed.name} (${templateSeed.sections.length} sections, ${templateSeed.sections.reduce((sum, s) => sum + s.items.length, 0)} items)`);
    } catch (error) {
      console.error(`❌ Failed to seed template "${templateSeed.name}":`, error);
      // Continue with next template even if one fails
    }
  }
  
  console.log(`🎉 Template seeding complete! Seeded ${seededCount} templates.`);
  return seededCount;
}

