import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { usePermissionsStore } from '@/stores/permissionsStore';
import { pdfThemesRepo } from '../../data/pdfThemes.repo';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

export function PdfThemesPage() {
  const { currentUser } = usePermissionsStore();
  const companyId = currentUser?.id || SHARED_COMPANY_ID;

  const [themes, setThemes] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadThemes();
  }, [companyId]);

  async function loadThemes() {
    try {
      const data = await pdfThemesRepo.list(companyId);
      setThemes(data);
    } catch (error) {
      console.error('Failed to load themes:', error);
    }
  }

  async function handleSave(theme: any) {
    setLoading(true);
    try {
      if (editing?.id) {
        await pdfThemesRepo.update(companyId, editing.id, theme);
      } else {
        await pdfThemesRepo.create(companyId, theme);
      }
      await loadThemes();
      setEditing(null);
    } catch (error) {
      console.error('Failed to save theme:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">PDF Themes</h1>
        <Button onClick={() => setEditing({})}>New Theme</Button>
      </div>

      {editing && (
        <Card className="p-4 space-y-3">
          <div className="text-sm font-semibold">{editing.id ? 'Edit' : 'New'} PDF Theme</div>
          <PdfThemeForm
            theme={editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
            loading={loading}
          />
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {themes.map((theme) => (
          <Card key={theme.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{theme.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Created {new Date(theme.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditing(theme)}>Edit</Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    if (confirm('Delete this theme?')) {
                      await pdfThemesRepo.remove(companyId, theme.id);
                      await loadThemes();
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

function PdfThemeForm({
  theme,
  onSave,
  onCancel,
  loading,
}: {
  theme: any;
  onSave: (theme: any) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState(theme.name || '');
  const [headerLeft, setHeaderLeft] = useState(theme.header_template?.left || '');
  const [headerCenter, setHeaderCenter] = useState(theme.header_template?.center || '');
  const [headerRight, setHeaderRight] = useState(theme.header_template?.right || '');
  const [footerLeft, setFooterLeft] = useState(theme.footer_template?.left || '');
  const [footerCenter, setFooterCenter] = useState(theme.footer_template?.center || '');
  const [footerRight, setFooterRight] = useState(theme.footer_template?.right || '');
  const [showPageNumbers, setShowPageNumbers] = useState(theme.footer_template?.showPageNumbers ?? true);
  const [watermarkEnabled, setWatermarkEnabled] = useState(theme.watermark?.enabled ?? false);
  const [watermarkText, setWatermarkText] = useState(theme.watermark?.text || 'DRAFT');

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
        <label className="text-xs text-slate-600">Header</label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            className="rounded border px-2 py-1 text-sm"
            placeholder="Left"
            value={headerLeft}
            onChange={(e) => setHeaderLeft(e.target.value)}
          />
          <input
            type="text"
            className="rounded border px-2 py-1 text-sm"
            placeholder="Center"
            value={headerCenter}
            onChange={(e) => setHeaderCenter(e.target.value)}
          />
          <input
            type="text"
            className="rounded border px-2 py-1 text-sm"
            placeholder="Right"
            value={headerRight}
            onChange={(e) => setHeaderRight(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-600">Footer</label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            className="rounded border px-2 py-1 text-sm"
            placeholder="Left"
            value={footerLeft}
            onChange={(e) => setFooterLeft(e.target.value)}
          />
          <input
            type="text"
            className="rounded border px-2 py-1 text-sm"
            placeholder="Center"
            value={footerCenter}
            onChange={(e) => setFooterCenter(e.target.value)}
          />
          <input
            type="text"
            className="rounded border px-2 py-1 text-sm"
            placeholder="Right"
            value={footerRight}
            onChange={(e) => setFooterRight(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 mt-2 text-xs">
          <input
            type="checkbox"
            checked={showPageNumbers}
            onChange={(e) => setShowPageNumbers(e.target.checked)}
          />
          <span>Show page numbers</span>
        </label>
      </div>
      <div>
        <label className="text-xs text-slate-600">Watermark</label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={watermarkEnabled}
            onChange={(e) => setWatermarkEnabled(e.target.checked)}
          />
          <span>Enable watermark</span>
        </label>
        {watermarkEnabled && (
          <input
            type="text"
            className="w-full rounded border px-2 py-1 text-sm mt-1"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
          />
        )}
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onSave({
            name,
            header_template: { left: headerLeft, center: headerCenter, right: headerRight },
            footer_template: { left: footerLeft, center: footerCenter, right: footerRight, showPageNumbers },
            watermark: { enabled: watermarkEnabled, text: watermarkText },
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

