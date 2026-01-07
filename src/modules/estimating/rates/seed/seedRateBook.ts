import { materialsRepo } from '../repos/materials.repo';
import { labourRepo } from '../repos/labour.repo';
import { plantRepo } from '../repos/plant.repo';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

const MATERIALS = [
  { name: '2x4 Timber (C16)', category: 'Timber', unit: 'm', base_cost: 3.50 },
  { name: '2x6 Timber (C16)', category: 'Timber', unit: 'm', base_cost: 5.20 },
  { name: '12.5mm Plasterboard', category: 'Plasterboard', unit: 'm2', base_cost: 4.80 },
  { name: '15mm Plasterboard', category: 'Plasterboard', unit: 'm2', base_cost: 5.50 },
  { name: 'Screws (6x100)', category: 'Fixings', unit: 'pack', base_cost: 8.50 },
  { name: 'Wall Plugs', category: 'Fixings', unit: 'pack', base_cost: 3.00 },
  { name: 'Cavity Insulation (100mm)', category: 'Insulation', unit: 'm2', base_cost: 12.00 },
  { name: 'Concrete Blocks', category: 'Blocks', unit: 'each', base_cost: 0.85 },
  { name: 'Cement', category: 'Mortar', unit: 'bag', base_cost: 6.50 },
  { name: 'Sharp Sand', category: 'Mortar', unit: 'tonne', base_cost: 45.00 },
  { name: 'Plaster Skim', category: 'Plaster', unit: 'bag', base_cost: 12.00 },
  { name: 'Emulsion Paint', category: 'Paint', unit: 'litre', base_cost: 15.00 },
  { name: 'LVT Flooring', category: 'Flooring', unit: 'm2', base_cost: 25.00 },
  { name: 'Floor Adhesive', category: 'Adhesive', unit: 'litre', base_cost: 8.00 },
  { name: 'Skirting Board (MDF)', category: 'Trim', unit: 'm', base_cost: 2.50 },
  { name: 'Internal Door', category: 'Doors', unit: 'each', base_cost: 85.00 },
  { name: 'Door Hinges', category: 'Ironmongery', unit: 'pair', base_cost: 12.00 },
];

const LABOUR_ROLES = [
  { trade: 'Carpenter', role: 'Lead', unit: 'hour', base_cost: 28 },
  { trade: 'Carpenter', role: 'Improver', unit: 'hour', base_cost: 20 },
  { trade: 'Electrician', role: 'Lead', unit: 'hour', base_cost: 32 },
  { trade: 'Electrician', role: 'Improver', unit: 'hour', base_cost: 22 },
  { trade: 'Plumber', role: 'Lead', unit: 'hour', base_cost: 30 },
  { trade: 'Plumber', role: 'Improver', unit: 'hour', base_cost: 20 },
  { trade: 'Labourer', unit: 'hour', base_cost: 15 },
  { trade: 'Bricklayer', unit: 'hour', base_cost: 22 },
  { trade: 'Plasterer', unit: 'hour', base_cost: 24 },
];

const PLANT_ITEMS = [
  { name: 'Skip (6 yard)', unit: 'day', base_cost: 120 },
  { name: 'Scaffold Tower', unit: 'day', base_cost: 45 },
  { name: 'Mixer', unit: 'day', base_cost: 25 },
  { name: 'Generator', unit: 'day', base_cost: 35 },
];

export async function seedRateBook(companyId: string | null | undefined) {
  const cid = getCompanyId(companyId);

  // Check if materials already exist
  const existingMaterials = await materialsRepo.list(cid);
  if (existingMaterials.length > 0) return; // Already seeded

  // Seed materials
  for (const mat of MATERIALS) {
    await materialsRepo.create(cid, mat);
  }

  // Seed labour
  for (const lab of LABOUR_ROLES) {
    await labourRepo.create(cid, lab as any);
  }

  // Seed plant
  for (const plant of PLANT_ITEMS) {
    await plantRepo.create(cid, plant);
  }
}

