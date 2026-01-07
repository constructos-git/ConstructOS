import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export function ApplyTemplateModal({
  open,
  templates,
  onClose,
  onApply,
}: {
  open: boolean;
  templates: any[];
  onClose: () => void;
  onApply: (templateId: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState<string>('');
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl bg-white">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="text-sm font-semibold">Apply quote template</div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="p-3 space-y-3 overflow-auto">
          <Card className="p-3 space-y-2">
            <div className="text-xs text-slate-500">
              Applying a template will overwrite the quote content for this estimate (you can edit afterwards).
            </div>
            <select className="w-full rounded border px-2 py-1 text-sm" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Select template…</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <Button disabled={!selected} onClick={async () => { await onApply(selected); onClose(); }}>
              Apply template
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

