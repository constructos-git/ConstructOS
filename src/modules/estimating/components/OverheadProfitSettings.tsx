import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Tooltip from '@/components/ui/Tooltip';
import { CollapsibleSection } from './CollapsibleSection';

export interface OverheadProfitSettings {
  default_margin_percent?: number;
  default_overhead_percent?: number;
  default_labour_burden_percent?: number;
  default_wastage_percent?: number;
  apply_overhead_to_labour?: boolean;
  apply_overhead_to_materials?: boolean;
  apply_overhead_to_plant?: boolean;
  apply_overhead_to_subcontract?: boolean;
  margin_on_cost_plus?: boolean;
  rounding_mode?: 'nearest' | 'up' | 'down' | 'none';
  rounding_precision?: number;
}

export function OverheadProfitSettings({
  settings,
  onChange,
}: {
  settings: OverheadProfitSettings;
  onChange: (settings: OverheadProfitSettings) => void;
}) {
  const [localSettings, setLocalSettings] = useState<OverheadProfitSettings>({
    default_margin_percent: 20.0,
    default_overhead_percent: 15.0,
    default_labour_burden_percent: 25.0,
    default_wastage_percent: 10.0,
    apply_overhead_to_labour: true,
    apply_overhead_to_materials: true,
    apply_overhead_to_plant: true,
    apply_overhead_to_subcontract: true,
    margin_on_cost_plus: true,
    rounding_mode: 'nearest',
    rounding_precision: 2,
    ...settings,
  });

  useEffect(() => {
    setLocalSettings({
      default_margin_percent: 20.0,
      default_overhead_percent: 15.0,
      default_labour_burden_percent: 25.0,
      default_wastage_percent: 10.0,
      apply_overhead_to_labour: true,
      apply_overhead_to_materials: true,
      apply_overhead_to_plant: true,
      apply_overhead_to_subcontract: true,
      margin_on_cost_plus: true,
      rounding_mode: 'nearest',
      rounding_precision: 2,
      ...settings,
    });
  }, [settings]);

  const updateSetting = (key: keyof OverheadProfitSettings, value: any) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onChange(updated);
  };

  return (
    <Card className="p-4 space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="text-base">Overhead & Profit Settings</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Configure default percentages and calculation rules for this quote
        </p>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Default Percentages */}
        <CollapsibleSection title="Default Percentages" defaultExpanded={true}>
          <div className="space-y-3">
            <div>
              <Tooltip content="Default profit margin percentage applied to all items unless overridden">
                <label className="text-sm font-medium mb-1 block">Default Margin (%)</label>
              </Tooltip>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={localSettings.default_margin_percent ?? 20.0}
                onChange={(e) => updateSetting('default_margin_percent', parseFloat(e.target.value) || 0)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Tooltip content="Default overhead percentage applied to cover company overheads">
                <label className="text-sm font-medium mb-1 block">Default Overhead (%)</label>
              </Tooltip>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={localSettings.default_overhead_percent ?? 15.0}
                onChange={(e) => updateSetting('default_overhead_percent', parseFloat(e.target.value) || 0)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Tooltip content="Default labour burden percentage (holiday pay, NI, pension, etc.)">
                <label className="text-sm font-medium mb-1 block">Default Labour Burden (%)</label>
              </Tooltip>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={localSettings.default_labour_burden_percent ?? 25.0}
                onChange={(e) => updateSetting('default_labour_burden_percent', parseFloat(e.target.value) || 0)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Tooltip content="Default wastage percentage for materials">
                <label className="text-sm font-medium mb-1 block">Default Wastage (%)</label>
              </Tooltip>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={localSettings.default_wastage_percent ?? 10.0}
                onChange={(e) => updateSetting('default_wastage_percent', parseFloat(e.target.value) || 0)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Overhead Application */}
        <CollapsibleSection title="Overhead Application" defaultExpanded={true}>
          <div className="space-y-2">
            <Tooltip content="Apply overhead percentage to labour items">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.apply_overhead_to_labour ?? true}
                  onChange={(e) => updateSetting('apply_overhead_to_labour', e.target.checked)}
                />
                Apply Overhead to Labour
              </label>
            </Tooltip>
            <Tooltip content="Apply overhead percentage to material items">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.apply_overhead_to_materials ?? true}
                  onChange={(e) => updateSetting('apply_overhead_to_materials', e.target.checked)}
                />
                Apply Overhead to Materials
              </label>
            </Tooltip>
            <Tooltip content="Apply overhead percentage to plant/equipment items">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.apply_overhead_to_plant ?? true}
                  onChange={(e) => updateSetting('apply_overhead_to_plant', e.target.checked)}
                />
                Apply Overhead to Plant
              </label>
            </Tooltip>
            <Tooltip content="Apply overhead percentage to subcontract items">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.apply_overhead_to_subcontract ?? true}
                  onChange={(e) => updateSetting('apply_overhead_to_subcontract', e.target.checked)}
                />
                Apply Overhead to Subcontract
              </label>
            </Tooltip>
          </div>
        </CollapsibleSection>

        {/* Calculation Rules */}
        <CollapsibleSection title="Calculation Rules" defaultExpanded={false}>
          <div className="space-y-3">
            <div>
              <Tooltip content="If enabled, margin is calculated on (cost + overhead). If disabled, margin is calculated on cost only.">
                <label className="text-sm font-medium mb-1 block">Margin Calculation</label>
              </Tooltip>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.margin_on_cost_plus ?? true}
                  onChange={(e) => updateSetting('margin_on_cost_plus', e.target.checked)}
                />
                Margin on (Cost + Overhead)
              </label>
            </div>
            <div>
              <Tooltip content="How to round calculated prices">
                <label className="text-sm font-medium mb-1 block">Rounding Mode</label>
              </Tooltip>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={localSettings.rounding_mode ?? 'nearest'}
                onChange={(e) => updateSetting('rounding_mode', e.target.value)}
              >
                <option value="nearest">Round to Nearest</option>
                <option value="up">Round Up</option>
                <option value="down">Round Down</option>
                <option value="none">No Rounding</option>
              </select>
            </div>
            <div>
              <Tooltip content="Number of decimal places for rounding">
                <label className="text-sm font-medium mb-1 block">Rounding Precision</label>
              </Tooltip>
              <input
                type="number"
                step="1"
                min="0"
                max="4"
                value={localSettings.rounding_precision ?? 2}
                onChange={(e) => updateSetting('rounding_precision', parseInt(e.target.value) || 2)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </CollapsibleSection>
      </CardContent>
    </Card>
  );
}

