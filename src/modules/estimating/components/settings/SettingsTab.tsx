import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { settingsRepo } from '../../rates/repos/settings.repo';

export function SettingsTab({ companyId }: { companyId: string }) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    loadSettings();
  }, [companyId]);

  async function loadSettings() {
    try {
      const data = await settingsRepo.getOrCreate(companyId);
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async function handleSave() {
    if (!settings) return;
    try {
      setLoading(true);
      await settingsRepo.update(companyId, {
        vat_rate: Number(settings.vat_rate),
        labour_burden_pct: Number(settings.labour_burden_pct),
        overhead_pct: Number(settings.overhead_pct),
        margin_pct: Number(settings.margin_pct),
        rounding_mode: settings.rounding_mode,
        pricing_mode: settings.pricing_mode,
        wastage_defaults: settings.wastage_defaults || {},
      });
      alert('Settings saved');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  }

  if (!settings) return <div className="text-sm">Loading...</div>;

  return (
    <Card className="p-4 space-y-4">
      <div className="text-sm font-semibold">Company Estimating Settings</div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs text-slate-600">VAT Rate (%)</label>
          <input
            type="number"
            className="w-full rounded border px-2 py-1 text-sm"
            value={settings.vat_rate}
            onChange={(e) => setSettings({ ...settings, vat_rate: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-slate-600">Labour Burden (%)</label>
          <input
            type="number"
            className="w-full rounded border px-2 py-1 text-sm"
            value={settings.labour_burden_pct}
            onChange={(e) => setSettings({ ...settings, labour_burden_pct: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-slate-600">Overhead (%)</label>
          <input
            type="number"
            className="w-full rounded border px-2 py-1 text-sm"
            value={settings.overhead_pct}
            onChange={(e) => setSettings({ ...settings, overhead_pct: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-slate-600">Margin (%)</label>
          <input
            type="number"
            className="w-full rounded border px-2 py-1 text-sm"
            value={settings.margin_pct}
            onChange={(e) => setSettings({ ...settings, margin_pct: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-slate-600">Rounding Mode</label>
          <select
            className="w-full rounded border px-2 py-1 text-sm text-slate-900 bg-white dark:text-slate-100 dark:bg-slate-900"
            value={settings.rounding_mode}
            onChange={(e) => setSettings({ ...settings, rounding_mode: e.target.value })}
          >
            <option value="none">None</option>
            <option value="nearest_1">Nearest £1</option>
            <option value="nearest_5">Nearest £5</option>
            <option value="nearest_10">Nearest £10</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-600">Pricing Mode</label>
          <select
            className="w-full rounded border px-2 py-1 text-sm text-slate-900 bg-white dark:text-slate-100 dark:bg-slate-900"
            value={settings.pricing_mode}
            onChange={(e) => setSettings({ ...settings, pricing_mode: e.target.value })}
          >
            <option value="cost_plus">Cost Plus</option>
            <option value="price_only">Price Only</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-600">Wastage Defaults (JSON)</label>
        <textarea
          className="w-full rounded border px-2 py-1 text-sm font-mono"
          rows={4}
          value={JSON.stringify(settings.wastage_defaults || {}, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setSettings({ ...settings, wastage_defaults: parsed });
            } catch {
              // Invalid JSON, ignore
            }
          }}
        />
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </Card>
  );
}

