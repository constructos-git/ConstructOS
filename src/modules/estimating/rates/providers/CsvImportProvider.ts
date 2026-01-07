import type { RateProvider, ProviderQuote } from './Provider';
import { supplierPriceListsRepo } from '../repos/supplierPriceLists.repo';

export const CsvImportProvider: RateProvider = {
  key: 'csv_import',
  label: 'CSV Import (Supplier Price Lists)',
  supports: ['materials'],
  isOnline: false,

  async getMaterial({ companyId, query }) {
    const rows = await supplierPriceListsRepo.search(companyId, query);
    const now = new Date().toISOString();
    return rows.slice(0, 20).map((r: any) => ({
      providerKey: 'csv_import',
      code: r.code || undefined,
      name: r.name,
      unit: r.unit,
      cost: Number(r.cost || 0),
      currency: 'GBP' as const,
      fetchedAt: now,
    }));
  },
};

