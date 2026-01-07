import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import { X } from 'lucide-react';

type Section = {
  id: string;
  title: string;
  margin_override_percent?: number | null;
  overhead_override_percent?: number | null;
  labour_burden_override_percent?: number | null;
  wastage_override_percent?: number | null;
};

export function SectionMarginOverride({
  section,
  onSave,
  onCancel,
}: {
  section: Section;
  onSave: (overrides: {
    margin_override_percent?: number | null;
    overhead_override_percent?: number | null;
    labour_burden_override_percent?: number | null;
    wastage_override_percent?: number | null;
  }) => void;
  onCancel: () => void;
}) {
  const [margin, setMargin] = useState<string>(section.margin_override_percent?.toString() || '');
  const [overhead, setOverhead] = useState<string>(section.overhead_override_percent?.toString() || '');
  const [labourBurden, setLabourBurden] = useState<string>(section.labour_burden_override_percent?.toString() || '');
  const [wastage, setWastage] = useState<string>(section.wastage_override_percent?.toString() || '');

  const handleSave = () => {
    onSave({
      margin_override_percent: margin ? parseFloat(margin) : null,
      overhead_override_percent: overhead ? parseFloat(overhead) : null,
      labour_burden_override_percent: labourBurden ? parseFloat(labourBurden) : null,
      wastage_override_percent: wastage ? parseFloat(wastage) : null,
    });
  };

  const handleClear = () => {
    setMargin('');
    setOverhead('');
    setLabourBurden('');
    setWastage('');
    onSave({
      margin_override_percent: null,
      overhead_override_percent: null,
      labour_burden_override_percent: null,
      wastage_override_percent: null,
    });
  };

  return (
    <Card className="p-4 space-y-3">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Override Margins for Section: {section.title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Override default percentages for all items in this section. Leave blank to use estimate defaults.
        </p>
      </CardHeader>

      <CardContent className="p-0 space-y-3">
        <div>
          <Tooltip content="Override margin percentage for all items in this section">
            <label className="text-sm font-medium mb-1 block">Margin Override (%)</label>
          </Tooltip>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            placeholder="Use estimate default"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <Tooltip content="Override overhead percentage for all items in this section">
            <label className="text-sm font-medium mb-1 block">Overhead Override (%)</label>
          </Tooltip>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={overhead}
            onChange={(e) => setOverhead(e.target.value)}
            placeholder="Use estimate default"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <Tooltip content="Override labour burden percentage for all items in this section">
            <label className="text-sm font-medium mb-1 block">Labour Burden Override (%)</label>
          </Tooltip>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={labourBurden}
            onChange={(e) => setLabourBurden(e.target.value)}
            placeholder="Use estimate default"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <Tooltip content="Override wastage percentage for all items in this section">
            <label className="text-sm font-medium mb-1 block">Wastage Override (%)</label>
          </Tooltip>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={wastage}
            onChange={(e) => setWastage(e.target.value)}
            placeholder="Use estimate default"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={handleSave}>
            Save Overrides
          </Button>
          <Button size="sm" variant="secondary" onClick={handleClear}>
            Clear All
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

