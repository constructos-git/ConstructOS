import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export function AcceptanceStatusCard({
  acceptance,
  onWithdraw,
}: {
  acceptance: any | null;
  onWithdraw?: () => Promise<void>;
}) {
  if (!acceptance) {
    return (
      <Card className="p-3">
        <div className="text-sm font-semibold">Acceptance</div>
        <div className="text-xs text-slate-500">Not accepted yet.</div>
      </Card>
    );
  }

  if (acceptance.is_withdrawn) {
    return (
      <Card className="p-3 bg-slate-100">
        <div className="text-sm font-semibold">Acceptance withdrawn</div>
        <div className="text-xs text-slate-500">Previously accepted by {acceptance.accepted_name}</div>
        <div className="text-xs text-slate-500">{new Date(acceptance.accepted_at).toLocaleString('en-GB')}</div>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      <div className="text-sm font-semibold">Accepted</div>
      <div className="text-sm">{acceptance.accepted_name}</div>
      <div className="text-xs text-slate-500">{acceptance.accepted_email}</div>
      <div className="text-xs text-slate-500">{new Date(acceptance.accepted_at).toLocaleString('en-GB')}</div>
      {acceptance.accepted_notes ? <div className="text-xs text-slate-600 mt-2 whitespace-pre-wrap">{acceptance.accepted_notes}</div> : null}
      {onWithdraw && (
        <div className="mt-2">
          <Button size="sm" variant="secondary" onClick={onWithdraw}>
            Withdraw acceptance
          </Button>
        </div>
      )}
    </Card>
  );
}

