import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function CreateRevisionModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (label: string) => Promise<void>;
}) {
  const [label, setLabel] = useState('Revised quotation');
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[70vh] rounded-t-xl bg-white">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="text-sm font-semibold">Create new revision</div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="p-3 space-y-3">
          <Card className="p-3 space-y-2">
            <label className="text-xs text-slate-600">Label</label>
            <input className="w-full rounded border px-2 py-1 text-sm" value={label} onChange={(e) => setLabel(e.target.value)} />
            <div className="text-xs text-slate-500">
              This will snapshot current quote content and client-visible scope into an immutable version.
            </div>
            <Button onClick={async () => { await onCreate(label); onClose(); }}>
              Create revision
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

