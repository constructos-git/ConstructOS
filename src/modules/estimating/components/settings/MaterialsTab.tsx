import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { materialsRepo } from '../../rates/repos/materials.repo';
import { MaterialDetailDrawer } from './MaterialDetailDrawer';

export function MaterialsTab({ companyId }: { companyId: string }) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [detailMaterialId, setDetailMaterialId] = useState<string | null>(null);

  useEffect(() => {
    loadMaterials();
  }, [companyId]);

  async function loadMaterials() {
    try {
      const data = search
        ? await materialsRepo.search(companyId, search)
        : await materialsRepo.list(companyId);
      setMaterials(data);
    } catch (error) {
      console.error('Failed to load materials:', error);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, [search]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Materials Catalogue</div>
        <input
          type="text"
          placeholder="Search..."
          className="rounded border px-2 py-1 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {materials.map((m) => (
          <div key={m.id} className="rounded border px-3 py-2 text-sm flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-slate-500">
                {m.category} • {m.unit} • £{Number(m.base_cost).toFixed(2)}
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setDetailMaterialId(m.id)}>
              View
            </Button>
          </div>
        ))}
        {materials.length === 0 && <div className="text-xs text-slate-500">No materials found</div>}
      </div>

      <MaterialDetailDrawer
        open={!!detailMaterialId}
        materialId={detailMaterialId}
        companyId={companyId}
        onClose={() => setDetailMaterialId(null)}
        onUpdateBaseCost={async (cost) => {
          if (detailMaterialId) {
            await materialsRepo.update(companyId, detailMaterialId, { base_cost: cost });
            await loadMaterials();
          }
        }}
      />
    </Card>
  );
}

