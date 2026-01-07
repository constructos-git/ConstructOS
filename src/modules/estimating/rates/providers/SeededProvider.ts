import type { RateProvider } from './Provider';
import { materialsRepo } from '../repos/materials.repo';
import { labourRepo } from '../repos/labour.repo';
import { plantRepo } from '../repos/plant.repo';

export const SeededProvider: RateProvider = {
  key: 'seeded',
  label: 'Seeded (offline)',
  supports: ['materials', 'labour', 'plant'],
  isOnline: false,

  async getMaterial({ companyId, query }) {
    const rows = await materialsRepo.search(companyId, query);
    const now = new Date().toISOString();
    return rows.slice(0, 20).map((r: any) => ({
      providerKey: 'seeded',
      code: r.code || undefined,
      name: r.name,
      unit: r.unit,
      cost: Number(r.base_cost || 0),
      currency: 'GBP' as const,
      fetchedAt: now,
    }));
  },

  async getLabour({ companyId, query }) {
    const rows = await labourRepo.search(companyId, query);
    const now = new Date().toISOString();
    return rows.slice(0, 20).map((r: any) => ({
      providerKey: 'seeded',
      name: `${r.trade}${r.role ? ` (${r.role})` : ''}`,
      unit: r.unit,
      cost: Number(r.base_cost || 0),
      currency: 'GBP' as const,
      fetchedAt: now,
    }));
  },

  async getPlant({ companyId, query }) {
    const rows = await plantRepo.search(companyId, query);
    const now = new Date().toISOString();
    return rows.slice(0, 20).map((r: any) => ({
      providerKey: 'seeded',
      name: r.name,
      unit: r.unit,
      cost: Number(r.base_cost || 0),
      currency: 'GBP' as const,
      fetchedAt: now,
    }));
  },
};

