import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { VersionDiffCard } from './VersionDiffCard';

export function QuoteVersionsPanel({
  versions,
  onOpen,
  onSend,
}: {
  versions: any[];
  onOpen: (versionId: string) => void;
  onSend: (versionId: string) => Promise<void>;
}) {
  const [a, setA] = useState<string>('');
  const [b, setB] = useState<string>('');
  const newer = versions.find((v) => v.id === a);
  const older = versions.find((v) => v.id === b);

  return (
    <Card className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Quote versions</div>
          <div className="text-xs text-slate-500">Snapshot and manage revisions.</div>
        </div>
      </div>

      <div className="space-y-2">
        {versions.map((v) => (
          <div key={v.id} className="rounded border px-2 py-2 flex items-center justify-between">
            <button type="button" className="text-left min-w-0 flex-1" onClick={() => onOpen(v.id)}>
              <div className="text-sm font-medium truncate">v{v.version_number} — {v.label || 'Quote'}</div>
              <div className="text-xs text-slate-500">Status: {v.status} • Total: £{Number(v.total || 0).toFixed(2)}</div>
            </button>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => onSend(v.id)}>Send</Button>
              <Button size="sm" variant="ghost" onClick={() => onOpen(v.id)}>Open</Button>
            </div>
          </div>
        ))}
        {versions.length === 0 ? <div className="text-xs text-slate-500">No versions yet. Create v1.</div> : null}
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <label className="text-xs text-slate-600">Compare (newer)</label>
          <select className="w-full rounded border px-2 py-1 text-sm" value={a} onChange={(e) => setA(e.target.value)}>
            <option value="">Select…</option>
            {versions.map((v) => <option key={v.id} value={v.id}>v{v.version_number}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600">Compare (older)</label>
          <select className="w-full rounded border px-2 py-1 text-sm" value={b} onChange={(e) => setB(e.target.value)}>
            <option value="">Select…</option>
            {versions.map((v) => <option key={v.id} value={v.id}>v{v.version_number}</option>)}
          </select>
        </div>
      </div>

      <VersionDiffCard newer={newer} older={older} />
    </Card>
  );
}

