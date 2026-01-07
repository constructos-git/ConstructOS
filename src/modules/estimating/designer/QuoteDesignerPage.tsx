import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { usePermissionsStore } from '@/stores/permissionsStore';
import { quoteLayoutsRepo } from '../data/quoteLayouts.repo';
import { brandPresetsRepo } from '../data/brandPresets.repo';
import { LayoutEditor } from './LayoutEditor';
import { defaultLayout, type LayoutBlock } from './blocks';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function QuoteDesignerPage() {
  const { currentUser } = usePermissionsStore();
  const companyId = currentUser?.id || SHARED_COMPANY_ID;

  const [layouts, setLayouts] = useState<any[]>([]);
  const [presets, setPresets] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [blocks, setBlocks] = useState<LayoutBlock[]>(defaultLayout);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [companyId]);

  async function loadData() {
    try {
      const [layoutData, presetData] = await Promise.all([
        quoteLayoutsRepo.list(companyId),
        brandPresetsRepo.list(companyId),
      ]);
      setLayouts(layoutData);
      setPresets(presetData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async function handleSave() {
    if (!editing) return;
    setLoading(true);
    try {
      if (editing.id) {
        await quoteLayoutsRepo.update(companyId, editing.id, { blocks });
      } else {
        await quoteLayoutsRepo.create(companyId, {
          name: editing.name || 'New Layout',
          brand_preset_id: editing.brand_preset_id || undefined,
          blocks,
        });
      }
      await loadData();
      setEditing(null);
    } catch (error) {
      console.error('Failed to save layout:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quote Layout Designer</h1>
        <Button onClick={() => {
          setEditing({});
          setBlocks(defaultLayout);
        }}>
          New Layout
        </Button>
      </div>

      {editing && (
        <Card className="p-4 space-y-3">
          <div className="text-sm font-semibold">{editing.id ? 'Edit' : 'New'} Layout</div>
          <div>
            <label className="text-xs text-slate-600">Name</label>
            <input
              type="text"
              className="w-full rounded border px-2 py-1 text-sm"
              value={editing.name || ''}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Brand Preset</label>
            <select
              className="w-full rounded border px-2 py-1 text-sm"
              value={editing.brand_preset_id || ''}
              onChange={(e) => setEditing({ ...editing, brand_preset_id: e.target.value || undefined })}
            >
              <option value="">None</option>
              {presets.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <LayoutEditor blocks={blocks} onChange={setBlocks} />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading || !editing.name?.trim()}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {layouts.map((layout) => (
          <Card key={layout.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{layout.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {layout.blocks?.filter((b: any) => b.enabled).length || 0} blocks enabled
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => {
                  setEditing(layout);
                  setBlocks(layout.blocks || defaultLayout);
                }}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    if (confirm('Delete this layout?')) {
                      await quoteLayoutsRepo.remove(companyId, layout.id);
                      await loadData();
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

