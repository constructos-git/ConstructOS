import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { plantRepo } from '../../rates/repos/plant.repo';

export function PlantTab({ companyId }: { companyId: string }) {
  const [plant, setPlant] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPlant();
  }, [companyId]);

  async function loadPlant() {
    try {
      const data = search
        ? await plantRepo.search(companyId, search)
        : await plantRepo.list(companyId);
      setPlant(data);
    } catch (error) {
      console.error('Failed to load plant:', error);
    }
  }

  useEffect(() => {
    loadPlant();
  }, [search]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Plant Catalogue</div>
        <input
          type="text"
          placeholder="Search..."
          className="rounded border px-2 py-1 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {plant.map((p) => (
          <div key={p.id} className="rounded border px-3 py-2 text-sm">
            <div className="font-medium">{p.name}</div>
            <div className="text-xs text-slate-500">
              {p.unit} • £{Number(p.base_cost).toFixed(2)}
            </div>
          </div>
        ))}
        {plant.length === 0 && <div className="text-xs text-slate-500">No plant items found</div>}
      </div>
    </Card>
  );
}

