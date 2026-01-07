import { useParams } from 'react-router-dom';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { tokensRepo } from '../data/tokens.repo';
import { snapshotsRepo } from '../data/snapshots.repo';
import { Card } from '@/components/ui/Card';
import { PortalThread } from './PortalThread';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PublicWorkOrderViewInner() {
  const { token } = useParams();
  const q = useQuery({
    queryKey: ['publicWorkOrder', token],
    queryFn: () => tokensRepo.fetchWorkOrderPublic(token as string),
    enabled: !!token,
  });

  if (q.isLoading) return <div className="p-4 text-sm">Loading…</div>;
  if (!q.data) return <div className="p-4 text-sm text-red-600">Link invalid or expired.</div>;

  const wo = q.data.workOrder;
  const lines = q.data.lines ?? [];
  
  // Try to load snapshots (preferred for version-based WOs)
  const snapshotsQ = useQuery({
    queryKey: ['woSnapshots', wo?.id],
    queryFn: () => snapshotsRepo.listWorkOrderSnapshots(null, wo.id),
    enabled: !!wo?.id,
  });
  
  const displayLines = (snapshotsQ.data && snapshotsQ.data.length > 0) ? snapshotsQ.data : lines;
  const fmt = (n: any) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n || 0));

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-3xl space-y-3">
        <Card className="p-3">
          <div className="text-lg font-semibold">Work Order</div>
          <div className="text-sm">{wo.title}</div>
          <div className="text-xs text-slate-500">Status: {wo.status}</div>
          <div className="text-xs text-slate-500">Contractor: {wo.assigned_to_name || '—'}</div>
        </Card>

        <Card className="p-3 space-y-2">
          <div className="text-sm font-semibold">Lines</div>
          {displayLines.map((l: any) => (
            <div key={l.id} className="rounded border px-2 py-2">
              <div className="text-sm font-medium">{l.title}</div>
              {l.description && <div className="text-xs text-slate-500">{l.description}</div>}
              <div className="text-xs text-slate-500">
                Qty: {l.quantity} {l.unit} • Line: {fmt(l.line_cost)}
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-3">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-medium">{fmt(wo.subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>VAT</span><span className="font-medium">{fmt(wo.vat_amount)}</span></div>
          <div className="flex justify-between text-sm"><span className="font-semibold">Total</span><span className="font-semibold">{fmt(wo.total)}</span></div>
        </Card>

        {token && <PortalThread token={token as string} />}
      </div>
    </div>
  );
}

export function PublicWorkOrderView() {
  return (
    <QueryClientProvider client={queryClient}>
      <PublicWorkOrderViewInner />
    </QueryClientProvider>
  );
}

