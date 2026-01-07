import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { labourRepo } from '../../rates/repos/labour.repo';

export function LabourTab({ companyId }: { companyId: string }) {
  const [labour, setLabour] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLabour();
  }, [companyId]);

  async function loadLabour() {
    try {
      const data = search
        ? await labourRepo.search(companyId, search)
        : await labourRepo.list(companyId);
      setLabour(data);
    } catch (error) {
      console.error('Failed to load labour:', error);
    }
  }

  useEffect(() => {
    loadLabour();
  }, [search]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Labour Catalogue</div>
        <input
          type="text"
          placeholder="Search..."
          className="rounded border px-2 py-1 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {labour.map((l) => (
          <div key={l.id} className="rounded border px-3 py-2 text-sm">
            <div className="font-medium">{l.trade}{l.role ? ` (${l.role})` : ''}</div>
            <div className="text-xs text-slate-500">
              {l.unit} • £{Number(l.base_cost).toFixed(2)}
            </div>
          </div>
        ))}
        {labour.length === 0 && <div className="text-xs text-slate-500">No labour roles found</div>}
      </div>
    </Card>
  );
}

