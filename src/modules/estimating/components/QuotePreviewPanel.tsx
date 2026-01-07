import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { CollapsibleSection } from './CollapsibleSection';
import Tooltip from '@/components/ui/Tooltip';

export function QuotePreviewPanel({
  estimate,
  totals,
}: {
  estimate: any;
  totals: { subtotal: number; vat: number; total: number };
}) {
  const fmt = (n: any) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n || 0));

  const summary = useMemo(() => {
    return [
      'This quotation is based on the information available at the time of estimating.',
      'Any changes to scope, specification, access constraints, or programme may result in a revised price.',
      'VAT is applied where applicable at the stated rate.',
    ];
  }, []);

  return (
    <Card className="p-4 space-y-4">
      <CollapsibleSection
        title="Quote Preview"
        tooltip="Preview of the totals that will appear in your client quote. Use the Quote Editor tab to customize the full quote presentation."
        defaultExpanded={true}
      >
        <div className="space-y-3">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <Tooltip content="Total cost of all items before VAT">
                <span>Subtotal</span>
              </Tooltip>
              <span className="font-medium">{fmt(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <Tooltip content={`Value Added Tax at ${estimate?.vat_rate ?? 20}%`}>
                <span>VAT ({estimate?.vat_rate ?? 20}%)</span>
              </Tooltip>
              <span className="font-medium">{fmt(totals.vat)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t">
              <Tooltip content="Final total including VAT">
                <span className="font-semibold">Total</span>
              </Tooltip>
              <span className="font-semibold">{fmt(totals.total)}</span>
            </div>
          </div>

          <div className="pt-2 border-t space-y-1">
            <div className="text-xs font-semibold text-muted-foreground mb-1">Standard Notes</div>
            {summary.map((s, i) => (
              <div key={i} className="text-xs text-muted-foreground">• {s}</div>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </Card>
  );
}

