import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { materialsRepo } from '../../rates/repos/materials.repo';
import { labourRepo } from '../../rates/repos/labour.repo';
import { plantRepo } from '../../rates/repos/plant.repo';
import { providerRegistry } from '../../rates/providers/providerRegistry';
import { providersRepo } from '../../rates/repos/providers.repo';
import { searchLiveRates } from '../../rates/providers/liveSearchClient';

export function RatePicker({
  companyId,
  itemType,
  onSelect,
  onClose,
}: {
  companyId: string;
  itemType: 'labour' | 'material' | 'plant' | 'subcontract';
  onSelect: (rate: { title: string; unit: string; unitCost: number; category?: string }) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [useLiveSearch, setUseLiveSearch] = useState(false);

  async function handleSearch() {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      let allResults: any[] = [];

      // Use live search if enabled and for materials
      if (useLiveSearch && itemType === 'material') {
        try {
          const liveResults = await searchLiveRates(companyId, search, 20);
          allResults = liveResults.results.map((q) => ({
            name: q.name,
            unit: q.unit,
            cost: q.cost,
            category: undefined,
            source: 'live',
            providerKey: q.providerKey,
          }));
        } catch (err) {
          console.warn('Live search failed, falling back:', err);
        }
      }

      // Fallback to local providers if no live results
      if (allResults.length === 0) {
        const providers = await providersRepo.list(companyId);
        const enabledProviders = providers.filter((p) => p.is_enabled);

        // Try enabled providers
        for (const provider of enabledProviders) {
          const providerImpl = providerRegistry[provider.provider_key];
          if (!providerImpl) continue;

          if (itemType === 'material' && providerImpl.getMaterial) {
            const quotes = await providerImpl.getMaterial({ companyId, query: search });
            allResults.push(...quotes.map((q) => ({ name: q.name, unit: q.unit, cost: q.cost, category: undefined, source: 'provider' })));
          } else if (itemType === 'labour' && providerImpl.getLabour) {
            const quotes = await providerImpl.getLabour({ companyId, query: search });
            allResults.push(...quotes.map((q) => ({ name: q.name, unit: q.unit, cost: q.cost, source: 'provider' })));
          } else if (itemType === 'plant' && providerImpl.getPlant) {
            const quotes = await providerImpl.getPlant({ companyId, query: search });
            allResults.push(...quotes.map((q) => ({ name: q.name, unit: q.unit, cost: q.cost, source: 'provider' })));
          }
        }

        // Final fallback to direct repo search
        if (allResults.length === 0) {
          if (itemType === 'material') {
            const data = await materialsRepo.search(companyId, search);
            allResults = data.map((r: any) => ({
              name: r.name,
              unit: r.unit,
              cost: Number(r.base_cost),
              category: r.category,
              source: 'repo',
            }));
          } else if (itemType === 'labour') {
            const data = await labourRepo.search(companyId, search);
            allResults = data.map((r: any) => ({
              name: `${r.trade}${r.role ? ` (${r.role})` : ''}`,
              unit: r.unit,
              cost: Number(r.base_cost),
              source: 'repo',
            }));
          } else if (itemType === 'plant') {
            const data = await plantRepo.search(companyId, search);
            allResults = data.map((r: any) => ({
              name: r.name,
              unit: r.unit,
              cost: Number(r.base_cost),
              source: 'repo',
            }));
          }
        }
      }

      setResults(allResults.slice(0, 20));
    } catch (error) {
      console.error('Failed to search rates:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[70vh] rounded-t-xl bg-white">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="text-sm font-semibold">Pick Rate ({itemType})</div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="p-3 space-y-3">
          {itemType === 'material' && (
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={useLiveSearch}
                onChange={(e) => setUseLiveSearch(e.target.checked)}
              />
              <span>Use live market rates</span>
            </label>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 rounded border px-2 py-1 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button size="sm" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {results.map((r, idx) => (
              <button
                key={idx}
                type="button"
                className="w-full text-left rounded border px-3 py-2 hover:bg-slate-50"
                onClick={() => {
                  onSelect({
                    title: r.name,
                    unit: r.unit,
                    unitCost: r.cost,
                    category: r.category,
                  });
                  onClose();
                }}
              >
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-xs text-slate-500">
                  {r.unit} • £{Number(r.cost).toFixed(2)}
                  {r.category && ` • ${r.category}`}
                </div>
              </button>
            ))}
            {results.length === 0 && search && !loading && (
              <div className="text-xs text-slate-500 text-center py-4">No results found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

