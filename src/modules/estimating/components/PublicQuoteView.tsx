import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { tokensRepo } from '../data/tokens.repo';
import { Card } from '@/components/ui/Card';
import { renderRichToHtml } from './rich/renderRich';
import { QuoteAcceptancePanel } from './QuoteAcceptancePanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PublicQuoteViewInner() {
  const { token } = useParams();
  const [accepted, setAccepted] = useState(false);

  const q = useQuery({
    queryKey: ['publicQuote', token],
    queryFn: () => tokensRepo.fetchQuotePublic(token as string),
    enabled: !!token,
  });

  if (q.isLoading) return <div className="p-4 text-sm">Loading…</div>;
  if (!q.data) return <div className="p-4 text-sm text-red-600">Link invalid or expired.</div>;

  // Check if this is a version-based response
  const isVersion = q.data.version !== undefined;
  const version = isVersion ? q.data.version : null;
  const estimate = isVersion ? null : q.data.estimate;
  const quote = isVersion ? null : q.data.quote;
  const sections = isVersion ? (version?.sections_snapshot ?? []) : (q.data.sections ?? []);
  const items = isVersion ? (version?.items_snapshot ?? []) : (q.data.items ?? []);

  // Use version totals if available, otherwise estimate totals
  const subtotal = isVersion ? Number(version?.subtotal ?? 0) : Number(estimate?.subtotal ?? 0);
  const vatAmount = isVersion ? Number(version?.vat_amount ?? 0) : Number(estimate?.vat_amount ?? 0);
  const total = isVersion ? Number(version?.total ?? 0) : Number(estimate?.total ?? 0);

  // Use version quote fields if available
  const quoteData = isVersion ? {
    intro_title: version?.intro_title ?? 'Quotation',
    intro_body_rich: version?.intro_body_rich ?? {},
    terms_body_rich: version?.terms_body_rich ?? {},
    inclusions: version?.inclusions ?? [],
    exclusions: version?.exclusions ?? [],
    assumptions: version?.assumptions ?? [],
    show_pricing_breakdown: version?.show_pricing_breakdown ?? true,
  } : quote;

  const fmt = (n: any) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n || 0));


  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-3xl space-y-3">
        <Card className="p-3">
          <div className="text-lg font-semibold">{quoteData?.intro_title || 'Quotation'}</div>
          {!isVersion && <div className="text-sm">{estimate?.title}</div>}
          {isVersion && version?.label && <div className="text-sm text-slate-500">{version.label}</div>}
        </Card>

        <Card className="p-3">
          <div className="text-sm" dangerouslySetInnerHTML={{ __html: renderRichToHtml(quoteData?.intro_body_rich) }} />
        </Card>

        {sections.map((s: any) => (
          <Card key={s.id} className="p-3">
            <div className="text-sm font-semibold">{s.title}</div>
            {s.client_narrative_rich ? (
              <div className="mt-2 text-sm" dangerouslySetInnerHTML={{ __html: renderRichToHtml(s.client_narrative_rich) }} />
            ) : null}
            {(items.filter((i: any) => i.section_id === s.id) ?? []).map((it: any) => (
              <div key={it.id} className="mt-2 rounded border px-2 py-2">
                <div className="text-sm font-medium">{it.title}</div>
                {quoteData?.show_pricing_breakdown ? (
                  <div className="text-xs text-slate-500">{it.quantity} {it.unit} • {fmt(it.line_total)}</div>
                ) : null}
              </div>
            ))}
          </Card>
        ))}

        <Card className="p-3">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-medium">{fmt(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>VAT</span><span className="font-medium">{fmt(vatAmount)}</span></div>
          <div className="flex justify-between text-sm"><span className="font-semibold">Total</span><span className="font-semibold">{fmt(total)}</span></div>
        </Card>

        {quoteData?.terms_body_rich ? (
          <Card className="p-3">
            <div className="text-sm font-semibold">Terms & Conditions</div>
            <div className="text-sm" dangerouslySetInnerHTML={{ __html: renderRichToHtml(quoteData.terms_body_rich) }} />
          </Card>
        ) : null}

        {accepted ? (
          <Card className="p-3 bg-green-50">
            <div className="text-sm font-semibold text-green-800">Quotation Accepted</div>
            <div className="text-xs text-green-700 mt-1">Thank you for accepting this quotation. We will be in touch shortly.</div>
          </Card>
        ) : (
          <QuoteAcceptancePanel token={token as string} onAccepted={() => setAccepted(true)} />
        )}
      </div>
    </div>
  );
}

export function PublicQuoteView() {
  return (
    <QueryClientProvider client={queryClient}>
      <PublicQuoteViewInner />
    </QueryClientProvider>
  );
}

