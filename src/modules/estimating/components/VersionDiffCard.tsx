import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';

function countItems(v: any) {
  const items = v?.items_snapshot ?? [];
  return Array.isArray(items) ? items.length : 0;
}
function countSections(v: any) {
  const s = v?.sections_snapshot ?? [];
  return Array.isArray(s) ? s.length : 0;
}

export function VersionDiffCard({ newer, older }: { newer: any; older: any }) {
  const diff = useMemo(() => {
    if (!newer || !older) return null;
    const totalDelta = Number(newer.total || 0) - Number(older.total || 0);
    const itemDelta = countItems(newer) - countItems(older);
    const sectionDelta = countSections(newer) - countSections(older);
    return { totalDelta, itemDelta, sectionDelta };
  }, [newer, older]);

  if (!diff) return null;

  return (
    <Card className="p-3">
      <div className="text-sm font-semibold">Revision summary</div>
      <div className="text-xs text-slate-500">High-level changes between selected versions.</div>
      <div className="mt-2 grid gap-2 md:grid-cols-3 text-sm">
        <div className="rounded border p-2">
          <div className="text-xs text-slate-500">Total change</div>
          <div className="font-semibold">{diff.totalDelta >= 0 ? '+' : ''}£{diff.totalDelta.toFixed(2)}</div>
        </div>
        <div className="rounded border p-2">
          <div className="text-xs text-slate-500">Items change</div>
          <div className="font-semibold">{diff.itemDelta >= 0 ? '+' : ''}{diff.itemDelta}</div>
        </div>
        <div className="rounded border p-2">
          <div className="text-xs text-slate-500">Sections change</div>
          <div className="font-semibold">{diff.sectionDelta >= 0 ? '+' : ''}{diff.sectionDelta}</div>
        </div>
      </div>
    </Card>
  );
}

