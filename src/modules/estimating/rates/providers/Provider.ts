export type ProviderQuote = {
  providerKey: string;
  code?: string;
  name: string;
  unit: string;
  cost: number;
  currency: 'GBP';
  fetchedAt: string;
};

export interface RateProvider {
  key: string;
  label: string;
  supports: Array<'materials' | 'labour' | 'plant'>;
  isOnline: boolean;

  getMaterial?(args: { companyId: string; query: string }): Promise<ProviderQuote[]>;
  getLabour?(args: { companyId: string; query: string }): Promise<ProviderQuote[]>;
  getPlant?(args: { companyId: string; query: string }): Promise<ProviderQuote[]>;
}

