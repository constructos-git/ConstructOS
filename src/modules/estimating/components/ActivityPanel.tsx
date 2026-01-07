import { Card } from '@/components/ui/Card';

export function ActivityPanel({ rows }: { rows: any[] }) {
  return (
    <Card className="p-3 space-y-2">
      <div className="text-sm font-semibold">Activity</div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded border px-2 py-2">
            <div className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString('en-GB')}</div>
            <div className="text-sm font-medium">{r.action}</div>
            {r.message ? <div className="text-xs text-slate-600">{r.message}</div> : null}
          </div>
        ))}
        {rows.length === 0 ? <div className="text-xs text-slate-500">No activity yet.</div> : null}
      </div>
    </Card>
  );
}

