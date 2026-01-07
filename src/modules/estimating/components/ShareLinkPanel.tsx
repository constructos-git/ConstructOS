import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export function ShareLinkPanel({
  tokenRow,
  shareUrl,
  onGenerate,
  onRevoke,
}: {
  tokenRow: any | null;
  shareUrl: string | null;
  onGenerate: (expiresAt: string | null) => Promise<void>;
  onRevoke: () => Promise<void>;
}) {
  const [expiryDays, setExpiryDays] = useState<number>(14);

  const expiresAt = useMemo(() => {
    if (!expiryDays || expiryDays <= 0) return null;
    const d = new Date();
    d.setDate(d.getDate() + expiryDays);
    return d.toISOString();
  }, [expiryDays]);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <Card className="p-3 space-y-2">
      <div className="text-sm font-semibold">Share link</div>
      {tokenRow && shareUrl ? (
        <>
          <div className="text-xs text-slate-500">Active link</div>
          <div className="rounded border px-2 py-2 text-xs break-all">{shareUrl}</div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => copy(shareUrl)}>Copy link</Button>
            <Button size="sm" variant="secondary" onClick={onRevoke}>Revoke</Button>
          </div>
          <div className="text-xs text-slate-500">
            Expires: {tokenRow.expires_at ? new Date(tokenRow.expires_at).toLocaleString('en-GB') : 'Never'}
          </div>
        </>
      ) : (
        <>
          <div className="text-xs text-slate-500">No link generated yet.</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-600">Expiry (days)</label>
              <input className="w-full rounded border px-2 py-1 text-sm" type="number" value={expiryDays} onChange={(e) => setExpiryDays(Number(e.target.value))} />
              <div className="text-[11px] text-slate-500">Set 0 for no expiry (optional).</div>
            </div>
            <div className="flex items-end">
              <Button className="w-full" size="sm" onClick={() => onGenerate(expiryDays <= 0 ? null : expiresAt)}>
                Generate link
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

