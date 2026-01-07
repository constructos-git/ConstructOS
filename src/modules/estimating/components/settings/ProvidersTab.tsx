import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { providersRepo } from '../../rates/repos/providers.repo';
import { providerRegistry } from '../../rates/providers/providerRegistry';
import { supplierPriceListsRepo } from '../../rates/repos/supplierPriceLists.repo';

export function ProvidersTab({ companyId }: { companyId: string }) {
  const [providers, setProviders] = useState<any[]>([]);
  const [priceLists, setPriceLists] = useState<any[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProviders();
    loadPriceLists();
  }, [companyId]);

  async function loadProviders() {
    try {
      const data = await providersRepo.list(companyId);
      // Ensure seeded provider exists
      if (data.length === 0) {
        await providersRepo.getOrCreate(companyId, 'seeded', { is_enabled: true });
      }
      const updated = await providersRepo.list(companyId);
      setProviders(updated);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  }

  async function loadPriceLists() {
    try {
      const data = await supplierPriceListsRepo.list(companyId);
      setPriceLists(data);
      // Enable csv_import if price lists exist
      if (data.length > 0) {
        await providersRepo.getOrCreate(companyId, 'csv_import', { is_enabled: true });
        await loadProviders();
      }
    } catch (error) {
      console.error('Failed to load price lists:', error);
    }
  }

  async function toggleProvider(providerKey: string, enabled: boolean) {
    try {
      await providersRepo.toggle(companyId, providerKey, enabled);
      await loadProviders();
    } catch (error) {
      console.error('Failed to toggle provider:', error);
    }
  }

  async function handleCsvImport(file: File) {
    try {
      // Simple CSV parser (can be replaced with papaparse later)
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        alert('CSV must have at least a header and one data row');
        return;
      }

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const nameIdx = headers.findIndex(h => h.includes('name'));
      const codeIdx = headers.findIndex(h => h.includes('code'));
      const unitIdx = headers.findIndex(h => h.includes('unit'));
      const costIdx = headers.findIndex(h => h.includes('cost') || h.includes('price'));

      if (nameIdx === -1 || costIdx === -1) {
        alert('CSV must have "name" and "cost" columns');
        return;
      }

      const items = lines.slice(1).map(line => {
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        return {
          code: codeIdx >= 0 ? cols[codeIdx] : undefined,
          name: cols[nameIdx],
          unit: unitIdx >= 0 ? cols[unitIdx] : 'each',
          cost: parseFloat(cols[costIdx]) || 0,
        };
      }).filter(item => item.name && item.cost > 0);

      if (items.length === 0) {
        alert('No valid items found in CSV');
        return;
      }

      // Create price list
      const list = await supplierPriceListsRepo.create(companyId, newSupplierName || 'Imported List');
      await supplierPriceListsRepo.importItems(companyId, list.id, items);
      
      alert(`Imported ${items.length} items`);
      setShowImport(false);
      setNewSupplierName('');
      await loadPriceLists();
    } catch (error) {
      console.error('Failed to import CSV:', error);
      alert('Failed to import CSV: ' + (error as Error).message);
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="text-sm font-semibold">Rate Providers</div>

      <div className="space-y-2">
        {Object.values(providerRegistry).map((provider) => {
          const dbProvider = providers.find((p) => p.provider_key === provider.key);
          const isEnabled = dbProvider?.is_enabled ?? false;
          return (
            <div key={provider.key} className="rounded border px-3 py-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{provider.label}</div>
                <div className="text-xs text-slate-500">
                  {provider.isOnline ? 'Online' : 'Offline'} • Supports: {provider.supports.join(', ')}
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => toggleProvider(provider.key, e.target.checked)}
                />
                <span className="text-xs">Enabled</span>
              </label>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="text-sm font-semibold mb-3">Supplier Price Lists</div>
        <div className="space-y-2">
          {priceLists.map((list) => (
            <div key={list.id} className="rounded border px-3 py-2 text-sm flex items-center justify-between">
              <div>
                <div className="font-medium">{list.supplier_name}</div>
                <div className="text-xs text-slate-500">
                  {list.is_active ? 'Active' : 'Inactive'} • Created {new Date(list.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button size="sm" variant="secondary" onClick={() => setShowImport(true)} className="mt-3">
          Import CSV Price List
        </Button>
      </div>

      {showImport && (
        <Card className="p-4 space-y-3 mt-4">
          <div className="text-sm font-semibold">Import Supplier Price List</div>
          <div>
            <label className="text-xs text-slate-600">Supplier Name</label>
            <input
              type="text"
              className="w-full rounded border px-2 py-1 text-sm"
              placeholder="e.g. Travis Perkins, Jewson"
              value={newSupplierName}
              onChange={(e) => setNewSupplierName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">CSV File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="w-full rounded border px-2 py-1 text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCsvImport(file);
              }}
            />
            <div className="text-xs text-slate-500 mt-1">
              Expected columns: name, cost (required), code, unit (optional)
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setShowImport(false); setNewSupplierName(''); }}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="text-xs text-slate-500">
        Additional providers (Travis Perkins, Jewson, etc.) coming soon.
      </div>
    </Card>
  );
}

