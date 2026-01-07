import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { usePermissionsStore } from '@/stores/permissionsStore';
import { brandPresetsRepo } from '../data/brandPresets.repo';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function BrandPresetsPage() {
  const { currentUser } = usePermissionsStore();
  const companyId = currentUser?.id || SHARED_COMPANY_ID;

  const [presets, setPresets] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPresets();
  }, [companyId]);

  async function loadPresets() {
    try {
      const data = await brandPresetsRepo.list(companyId);
      setPresets(data);
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  }

  async function handleSave(preset: any) {
    setLoading(true);
    try {
      if (editing?.id) {
        await brandPresetsRepo.update(companyId, editing.id, preset);
      } else {
        await brandPresetsRepo.create(companyId, preset);
      }
      await loadPresets();
      setEditing(null);
    } catch (error) {
      console.error('Failed to save preset:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brand Presets</h1>
        <Button onClick={() => setEditing({})}>New Preset</Button>
      </div>

      {editing && (
        <Card className="p-4 space-y-3">
          <div className="text-sm font-semibold">{editing.id ? 'Edit' : 'New'} Brand Preset</div>
          <BrandPresetForm
            preset={editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
            loading={loading}
          />
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {presets.map((preset) => (
          <Card key={preset.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{preset.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {preset.primary_color && (
                    <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: preset.primary_color }} />
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditing(preset)}>Edit</Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    if (confirm('Delete this preset?')) {
                      await brandPresetsRepo.remove(companyId, preset.id);
                      await loadPresets();
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

function BrandPresetForm({
  preset,
  onSave,
  onCancel,
  loading,
}: {
  preset: any;
  onSave: (preset: any) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState(preset.name || '');
  const [logoUrl, setLogoUrl] = useState(preset.logo_url || '');
  const [primaryColor, setPrimaryColor] = useState(preset.primary_color || '#000000');
  const [secondaryColor, setSecondaryColor] = useState(preset.secondary_color || '#666666');
  const [fontFamily, setFontFamily] = useState(preset.font_family || 'Arial');
  const [headerHtml, setHeaderHtml] = useState(preset.header_html || '');
  const [footerHtml, setFooterHtml] = useState(preset.footer_html || '');

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-600">Name</label>
        <input
          type="text"
          className="w-full rounded border px-2 py-1 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs text-slate-600">Logo URL</label>
        <input
          type="text"
          className="w-full rounded border px-2 py-1 text-sm"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-slate-600">Primary Color</label>
          <input
            type="color"
            className="w-full rounded border"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-slate-600">Secondary Color</label>
          <input
            type="color"
            className="w-full rounded border"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-600">Font Family</label>
        <select
          className="w-full rounded border px-2 py-1 text-sm"
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-600">Header HTML</label>
        <textarea
          className="w-full rounded border px-2 py-1 text-sm"
          rows={3}
          value={headerHtml}
          onChange={(e) => setHeaderHtml(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs text-slate-600">Footer HTML</label>
        <textarea
          className="w-full rounded border px-2 py-1 text-sm"
          rows={3}
          value={footerHtml}
          onChange={(e) => setFooterHtml(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onSave({
            name,
            logo_url: logoUrl || undefined,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            font_family: fontFamily,
            header_html: headerHtml || undefined,
            footer_html: footerHtml || undefined,
          })}
          disabled={loading || !name.trim()}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

