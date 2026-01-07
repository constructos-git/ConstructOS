// Visibility Settings Panel Component

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import type { VisibilitySettings } from '../../domain/types';

interface VisibilitySettingsPanelProps {
  settings: VisibilitySettings;
  onUpdate: (settings: VisibilitySettings) => void;
}

export function VisibilitySettingsPanel({
  settings,
  onUpdate,
}: VisibilitySettingsPanelProps) {
  const handleToggle = (key: keyof VisibilitySettings) => {
    onUpdate({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility & Formatting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={settings.showSectionTotals}
              onCheckedChange={() => handleToggle('showSectionTotals')}
            />
            <span className="text-sm">Show section totals</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={settings.showVat}
              onCheckedChange={() => handleToggle('showVat')}
            />
            <span className="text-sm">Show VAT line</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={settings.showTotalsWithVat}
              onCheckedChange={() => handleToggle('showTotalsWithVat')}
            />
            <span className="text-sm">Show totals with VAT</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={settings.showTotalsWithoutVat}
              onCheckedChange={() => handleToggle('showTotalsWithoutVat')}
            />
            <span className="text-sm">Show totals without VAT</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={settings.showProvisionalSums}
              onCheckedChange={() => handleToggle('showProvisionalSums')}
            />
            <span className="text-sm">Show provisional sums</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={settings.showGrandTotalOnly}
              onCheckedChange={() => handleToggle('showGrandTotalOnly')}
            />
            <span className="text-sm">Show grand total only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={settings.showDescriptions}
              onCheckedChange={() => handleToggle('showDescriptions')}
            />
            <span className="text-sm">Show descriptions</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={settings.showLabourItems}
              onCheckedChange={() => handleToggle('showLabourItems')}
            />
            <span className="text-sm">Show labour items</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={settings.showMaterialItems}
              onCheckedChange={() => handleToggle('showMaterialItems')}
            />
            <span className="text-sm">Show material items</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={settings.showLineTotals}
              onCheckedChange={() => handleToggle('showLineTotals')}
            />
            <span className="text-sm">Show line item totals</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={settings.showQuantities}
              onCheckedChange={() => handleToggle('showQuantities')}
            />
            <span className="text-sm">Show quantities</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={settings.showUnits}
              onCheckedChange={() => handleToggle('showUnits')}
            />
            <span className="text-sm">Show units</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={settings.showNotes}
              onCheckedChange={() => handleToggle('showNotes')}
            />
            <span className="text-sm">Show notes</span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

