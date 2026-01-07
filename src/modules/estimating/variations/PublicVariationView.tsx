import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { SignaturePad } from '../components/public/SignaturePad';

export function PublicVariationView() {
  const { token } = useParams();
  const [variation, setVariation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApproval, setShowApproval] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState<{ base64: string; hash: string } | null>(null);
  const [declarations, setDeclarations] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) loadVariation();
  }, [token]);

  async function loadVariation() {
    if (!token) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_variation_by_token', { p_token: token });
      if (error) throw error;
      if (data?.variation) {
        setVariation(data.variation);
      }
    } catch (error) {
      console.error('Failed to load variation:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(action: 'approved' | 'rejected') {
    if (!token || !name.trim() || !email.trim() || !signature) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc('submit_variation_approval', {
        p_token: token,
        p_action: action,
        p_name: name,
        p_email: email,
        p_notes: notes || '',
        p_signature_png_base64: signature.base64,
        p_signature_sha256: signature.hash,
        p_declarations: declarations,
        p_ip: '',
        p_user_agent: navigator.userAgent,
      });
      if (error) throw error;
      await loadVariation();
      setShowApproval(false);
      alert(`Variation ${action === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Failed to submit approval:', error);
      alert('Failed to submit approval');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (!variation) return <div className="p-4">Variation not found or expired</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Card className="p-4">
          <h1 className="text-2xl font-bold">{variation.title}</h1>
          {variation.description && <p className="text-sm text-slate-600 mt-1">{variation.description}</p>}
          <div className="mt-2">
            <span className={`px-2 py-1 rounded text-xs ${variation.status === 'approved' ? 'bg-green-100 text-green-800' : variation.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
              {variation.status}
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-semibold mb-3">Variation Lines</div>
          <div className="space-y-2">
            {(variation.lines || []).map((line: any, idx: number) => (
              <div key={idx} className="flex justify-between border-b pb-2">
                <div>
                  <div className="font-medium">{line.title}</div>
                  {line.description && <div className="text-xs text-slate-500">{line.description}</div>}
                </div>
                <div className="text-right">
                  <div>{line.quantity} {line.unit}</div>
                  <div className="font-semibold">£{line.priceExVat?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>£{Number(variation.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT ({variation.vat_rate}%):</span>
              <span>£{Number(variation.vat_amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-lg">
              <span>Total:</span>
              <span>£{Number(variation.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {variation.status === 'sent' && (
          <Card className="p-4">
            <div className="flex gap-2">
              <Button onClick={() => setShowApproval(true)}>Approve Variation</Button>
              <Button variant="secondary" onClick={() => {
                setShowApproval(true);
                // Will use action='rejected' in handler
              }}>
                Reject Variation
              </Button>
            </div>
          </Card>
        )}

        {showApproval && (
          <Card className="p-4 space-y-3">
            <div className="text-sm font-semibold">Approve/Reject Variation</div>
            <div>
              <label className="text-xs text-slate-600">Full Name</label>
              <input
                type="text"
                className="w-full rounded border px-2 py-1 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Email</label>
              <input
                type="email"
                className="w-full rounded border px-2 py-1 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Notes (optional)</label>
              <textarea
                className="w-full rounded border px-2 py-1 text-sm"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Signature</label>
              <SignaturePad
                onSave={(sig) => setSignature(sig)}
                onClear={() => setSignature(null)}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={declarations.authority || false}
                  onChange={(e) => setDeclarations({ ...declarations, authority: e.target.checked })}
                />
                <span>I confirm I am authorised to approve/reject this variation</span>
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleApprove('approved')}
                disabled={submitting || !name.trim() || !email.trim() || !signature || !declarations.authority}
              >
                {submitting ? 'Submitting...' : 'Approve'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleApprove('rejected')}
                disabled={submitting || !name.trim() || !email.trim() || !signature || !declarations.authority}
              >
                {submitting ? 'Submitting...' : 'Reject'}
              </Button>
              <Button variant="ghost" onClick={() => setShowApproval(false)}>Cancel</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

