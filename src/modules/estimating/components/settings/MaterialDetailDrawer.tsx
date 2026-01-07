import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { lastBuyRepo } from '../../rates/repos/lastBuy.repo';
import { historyRepo } from '../../rates/repos/history.repo';
import { searchLiveRates } from '../../rates/providers/liveSearchClient';
import { materialsRepo } from '../../rates/repos/materials.repo';

export function MaterialDetailDrawer({
  open,
  materialId,
  companyId,
  onClose,
  onUpdateBaseCost,
}: {
  open: boolean;
  materialId: string | null;
  companyId: string;
  onClose: () => void;
  onUpdateBaseCost: (cost: number) => void;
}) {
  const [material, setMaterial] = useState<any>(null);
  const [lastBuy, setLastBuy] = useState<any>(null);
  const [marketCost, setMarketCost] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !materialId) return;
    loadData();
  }, [open, materialId, companyId]);

  async function loadData() {
    if (!materialId) return;
    setLoading(true);
    try {
      // Load material
      const materials = await materialsRepo.list(companyId);
      const mat = materials.find((m: any) => m.id === materialId);
      setMaterial(mat);

      if (!mat) return;

      // Load last buy
      const lb = await lastBuyRepo.get(companyId, mat.name, mat.unit);
      setLastBuy(lb);

      // Search live rates
      const liveResults = await searchLiveRates(companyId, mat.name, 1);
      if (liveResults.results.length > 0) {
        const bestMatch = liveResults.results[0];
        setMarketCost(bestMatch.cost);
      }

      // Load history
      const hist = await historyRepo.getHistory(companyId, mat.name, undefined, 30);
      setHistory(hist);
    } catch (error) {
      console.error('Failed to load material details:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!open || !material) return null;

  const baseCost = Number(material.base_cost || 0);
  const lastBuyCost = lastBuy ? Number(lastBuy.last_buy_cost || 0) : null;
  const variance = marketCost && lastBuyCost
    ? ((marketCost - lastBuyCost) / lastBuyCost) * 100
    : null;

  const fmt = (n: number | null) => {
    if (n === null) return 'N/A';
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-xl bg-white overflow-auto">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">{material.name}</div>
              <div className="text-sm text-slate-500">{material.code || 'No code'}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
          </div>

          {loading ? (
            <div className="text-sm text-slate-500">Loading...</div>
          ) : (
            <>
              <Card className="p-4 space-y-3">
                <div className="text-sm font-semibold">Cost Comparison</div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded border p-3">
                    <div className="text-xs text-slate-500">Company Base Cost</div>
                    <div className="text-lg font-semibold">{fmt(baseCost)}</div>
                    <div className="text-xs text-slate-500">per {material.unit}</div>
                  </div>
                  <div className="rounded border p-3">
                    <div className="text-xs text-slate-500">Last Buy Cost</div>
                    <div className="text-lg font-semibold">{fmt(lastBuyCost)}</div>
                    {lastBuy && (
                      <div className="text-xs text-slate-500">
                        {new Date(lastBuy.last_buy_at).toLocaleDateString()}
                        {lastBuy.source_supplier && ` • ${lastBuy.source_supplier}`}
                      </div>
                    )}
                  </div>
                  <div className="rounded border p-3">
                    <div className="text-xs text-slate-500">Market Cost</div>
                    <div className="text-lg font-semibold">{fmt(marketCost)}</div>
                    <div className="text-xs text-slate-500">Current market rate</div>
                  </div>
                </div>

                {variance !== null && (
                  <div className="rounded border p-3 bg-slate-50">
                    <div className="text-xs text-slate-600">Variance</div>
                    <div className={`text-lg font-semibold ${variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500">
                      {variance >= 0 ? 'Above last buy' : 'Below last buy'}
                    </div>
                  </div>
                )}
              </Card>

              {history.length > 0 && (
                <Card className="p-4">
                  <div className="text-sm font-semibold mb-3">Price History (Last 30 Days)</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {history.map((h) => (
                      <div key={h.id} className="flex justify-between text-sm border-b pb-1">
                        <div>
                          <div>{new Date(h.observed_at).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500">{h.provider_key}</div>
                        </div>
                        <div className="font-semibold">{fmt(h.cost)}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <div className="flex gap-2">
                {marketCost !== null && marketCost !== baseCost && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (confirm(`Update base cost from ${fmt(baseCost)} to ${fmt(marketCost)}?`)) {
                        onUpdateBaseCost(marketCost);
                        onClose();
                      }
                    }}
                  >
                    Update Base Cost to Market
                  </Button>
                )}
                <Button variant="ghost" onClick={onClose}>Close</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

