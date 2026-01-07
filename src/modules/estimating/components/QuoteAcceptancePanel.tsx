import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { acceptancesRepo } from '../data/acceptances.repo';
import { SignaturePad } from './public/SignaturePad';

const DEFAULT_DECLARATIONS = [
  'I confirm I am authorised to accept this quotation.',
  'I understand any variations may be priced separately and agreed in writing.',
  'I understand the programme may be affected by access, lead times, weather, and third parties.',
];

export function QuoteAcceptancePanel({
  token,
  onAccepted,
}: {
  token: string;
  onAccepted: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [signature, setSignature] = useState<{ base64: string; hash: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const allChecked = DEFAULT_DECLARATIONS.every((_, i) => checks[i]);

  async function submit() {
    setSubmitting(true);
    try {
      const declarationsObj: Record<string, boolean> = {};
      DEFAULT_DECLARATIONS.forEach((d, i) => {
        declarationsObj[`declaration_${i}`] = !!checks[i];
      });

      await acceptancesRepo.submitPublic(token, {
        name,
        email,
        notes,
        declarations: declarationsObj,
        signaturePngBase64: signature?.base64,
        signatureSha256: signature?.hash,
        userAgent: navigator.userAgent,
      });
      onAccepted();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-3 space-y-3">
      <div>
        <div className="text-sm font-semibold">Accept quotation</div>
        <div className="text-xs text-slate-500">Complete the details below to confirm acceptance.</div>
      </div>

      <div className="grid gap-2">
        <div>
          <label className="text-xs text-slate-600">Full name</label>
          <input className="w-full rounded border px-2 py-1 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-600">Email</label>
          <input className="w-full rounded border px-2 py-1 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-600">Notes (optional)</label>
          <textarea className="w-full rounded border px-2 py-1 text-sm min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="space-y-2">
          {DEFAULT_DECLARATIONS.map((d, i) => (
            <label key={i} className="flex gap-2 text-sm">
              <input type="checkbox" checked={!!checks[i]} onChange={(e) => setChecks((p) => ({ ...p, [i]: e.target.checked }))} />
              <span>{d}</span>
            </label>
          ))}
        </div>

        <div>
          <label className="text-xs text-slate-600">Signature</label>
          <SignaturePad
            onSave={(sig) => setSignature(sig)}
            onClear={() => setSignature(null)}
          />
        </div>

        <Button
          disabled={!name.trim() || !email.trim() || !allChecked || !signature || submitting}
          onClick={submit}
        >
          {submitting ? 'Submitting…' : 'Accept quotation'}
        </Button>
      </div>

      <div className="text-[11px] text-slate-500">
        By accepting, you agree that this electronic confirmation forms evidence of acceptance, recorded with date/time and associated link token.
      </div>
    </Card>
  );
}

