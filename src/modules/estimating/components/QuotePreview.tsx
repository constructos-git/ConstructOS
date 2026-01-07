import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { renderRichToHtml } from './rich/renderRich';
import type { QuoteDisplaySettings } from './QuoteDisplaySettings';

function parseDisplaySettings(settings: unknown): QuoteDisplaySettings {
  if (!settings) return {};
  if (typeof settings === 'string') {
    try {
      return JSON.parse(settings);
    } catch {
      return {};
    }
  }
  if (typeof settings === 'object') {
    return settings as QuoteDisplaySettings;
  }
  return {};
}

export function QuotePreview({
  estimate,
  quote,
  sections,
  items,
  version,
}: {
  estimate: any;
  quote: any;
  sections: any[];
  items: any[];
  version?: any;
}) {
  // If version provided, use version snapshot data
  const isVersionMode = !!version;
  const displaySections = isVersionMode ? (version.sections_snapshot ?? []) : sections;
  const displayItems = isVersionMode ? (version.items_snapshot ?? []) : items;
  const displayQuote = isVersionMode ? {
    intro_title: version.intro_title ?? 'Quotation',
    intro_body_rich: version.intro_body_rich ?? {},
    programme_notes_rich: version.programme_notes_rich ?? {},
    payment_notes_rich: version.payment_notes_rich ?? {},
    warranty_notes_rich: version.warranty_notes_rich ?? {},
    terms_body_rich: version.terms_body_rich ?? {},
    inclusions: version.inclusions ?? [],
    exclusions: version.exclusions ?? [],
    assumptions: version.assumptions ?? [],
    show_pricing_breakdown: version.show_pricing_breakdown ?? true,
    show_section_details: version.show_section_details ?? true,
    display_settings: version.display_settings ?? {},
    logo_url: version.branding?.logo_url ?? null,
    primary_color: version.branding?.primary_color ?? null,
    secondary_color: version.branding?.secondary_color ?? null,
    font_family: version.branding?.font_family ?? null,
    layout_style: version.branding?.layout_style ?? null,
  } : quote;

  const displaySettings = parseDisplaySettings(displayQuote?.display_settings);
  const displayEstimate = isVersionMode ? {
    subtotal: version.subtotal ?? 0,
    vat_rate: version.vat_rate ?? 0,
    vat_amount: version.vat_amount ?? 0,
    total: version.total ?? 0,
  } : estimate;
  const fmt = (n: any) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n || 0));

  const branding = useMemo(() => ({
    logo_url: displayQuote?.logo_url ?? '',
    primary: displayQuote?.primary_color ?? '#0f172a',
    secondary: displayQuote?.secondary_color ?? '#334155',
    font: displayQuote?.font_family ?? 'Inter',
    layout: displayQuote?.layout_style ?? 'classic',
  }), [displayQuote]);

  // Filter sections and items based on visibility flags
  const visibleSections = (displaySections ?? []).filter((s: any) => s.is_client_visible);
  let visibleItems = (displayItems ?? []).filter((i: any) => i.is_client_visible);

  // Apply item type filters
  if (displaySettings.show_labour === false) {
    visibleItems = visibleItems.filter((i: any) => i.item_type !== 'labour');
  }
  if (displaySettings.show_materials === false) {
    visibleItems = visibleItems.filter((i: any) => i.item_type !== 'material');
  }
  if (displaySettings.show_plant === false) {
    visibleItems = visibleItems.filter((i: any) => i.item_type !== 'plant');
  }
  if (displaySettings.show_subcontract === false) {
    visibleItems = visibleItems.filter((i: any) => i.item_type !== 'subcontract');
  }
  if (displaySettings.show_combined === false) {
    visibleItems = visibleItems.filter((i: any) => i.item_type !== 'combined');
  }

  const itemsBySection = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const it of visibleItems) {
      const sid = it.section_id || '__none__';
      map[sid] = map[sid] || [];
      map[sid].push(it);
    }
    // Group by item type if enabled
    if (displaySettings.group_by_item_type) {
      const grouped: Record<string, Record<string, any[]>> = {};
      for (const [sid, items] of Object.entries(map)) {
        grouped[sid] = {};
        for (const item of items) {
          const type = item.item_type || 'other';
          if (!grouped[sid][type]) grouped[sid][type] = [];
          grouped[sid][type].push(item);
        }
      }
      // Flatten back but preserve grouping structure for rendering
      return map; // For now, keep simple structure but could enhance
    }
    return map;
  }, [visibleItems, displaySettings.group_by_item_type]);

  const inclusions = Array.isArray(displayQuote?.inclusions) ? displayQuote.inclusions : typeof displayQuote?.inclusions === 'string' ? JSON.parse(displayQuote.inclusions || '[]') : [];
  const exclusions = Array.isArray(displayQuote?.exclusions) ? displayQuote.exclusions : typeof displayQuote?.exclusions === 'string' ? JSON.parse(displayQuote.exclusions || '[]') : [];
  const assumptions = Array.isArray(displayQuote?.assumptions) ? displayQuote.assumptions : typeof displayQuote?.assumptions === 'string' ? JSON.parse(displayQuote.assumptions || '[]') : [];

  return (
    <Card className="p-4">
      <div style={{ fontFamily: branding.font }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xl font-semibold" style={{ color: branding.primary }}>
              {displayQuote?.intro_title || 'Quotation'}
            </div>
            <div className="text-xs text-slate-500">Estimate: {estimate?.title}</div>
          </div>
          {branding.logo_url ? (
            <img src={branding.logo_url} alt="Logo" className="h-10 object-contain" />
          ) : null}
        </div>

        <div className="mt-4 text-sm" dangerouslySetInnerHTML={{ __html: renderRichToHtml(displayQuote?.intro_body_rich) }} />

        <div className="mt-6 space-y-4">
          {visibleSections.map((s: any) => {
            const sectionItems = itemsBySection[s.id] ?? [];
            const sectionTotal = sectionItems.reduce((sum, it) => sum + (Number(it.line_total) || 0), 0);
            const sectionDisplayMode = displaySettings.section_display_mode ?? 'expanded';
            const isCollapsed = sectionDisplayMode === 'collapsed';
            const isSummaryOnly = sectionDisplayMode === 'summary_only';

            return (
              <div key={s.id}>
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold" style={{ color: branding.secondary }}>{s.title}</div>
                  {displaySettings.show_section_totals && sectionItems.length > 0 && (
                    <div className="text-sm font-medium">{fmt(sectionTotal)}</div>
                  )}
                </div>
                {displaySettings.show_client_narratives !== false && s.client_narrative_rich ? (
                  <div className="mt-2 text-sm" dangerouslySetInnerHTML={{ __html: renderRichToHtml(s.client_narrative_rich) }} />
                ) : null}
                {!isCollapsed && !isSummaryOnly && (displayQuote?.show_section_details !== false) && (
                  <div className="mt-2 space-y-2">
                    {sectionItems.map((it: any) => {
                      const itemDisplayMode = displaySettings.item_display_mode ?? 'detailed';
                      const isMinimal = itemDisplayMode === 'minimal';
                      const isSummary = itemDisplayMode === 'summary';

                      return (
                        <div key={it.id} className="rounded border px-3 py-2">
                          <div className="text-sm font-medium">{it.title}</div>
                          {!isMinimal && displaySettings.show_descriptions !== false && it.description ? (
                            <div className="text-xs text-slate-500">{it.description}</div>
                          ) : null}
                          {!isMinimal && displaySettings.show_pricing_breakdown !== false && displayQuote?.show_pricing_breakdown ? (
                            <div className="text-xs text-slate-600 mt-1">
                              {displaySettings.show_quantities !== false && `${it.quantity} ${it.unit}`}
                              {displaySettings.show_unit_prices !== false && ` × ${fmt(it.unit_price)}`}
                              {displaySettings.show_line_totals !== false && ` = ${fmt(it.line_total)}`}
                            </div>
                          ) : null}
                          {isSummary && displaySettings.show_line_totals !== false && (
                            <div className="text-xs text-slate-600 mt-1 font-semibold">{fmt(it.line_total)}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {displaySettings.show_pricing_summary !== false && (
          <div className="mt-6 rounded border p-3">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-medium">{fmt(displayEstimate?.subtotal || 0)}</span></div>
            {displaySettings.show_vat !== false && (
              <div className="flex justify-between text-sm"><span>VAT ({displayEstimate?.vat_rate || 0}%)</span><span className="font-medium">{fmt(displayEstimate?.vat_amount || 0)}</span></div>
            )}
            <div className="flex justify-between text-sm"><span className="font-semibold">Total</span><span className="font-semibold">{fmt(displayEstimate?.total || 0)}</span></div>
          </div>
        )}

        {displaySettings.show_programme_notes !== false && displayQuote?.programme_notes_rich ? (
          <div className="mt-6">
            <div className="text-sm font-semibold">Programme / Timeline</div>
            <div className="text-sm" dangerouslySetInnerHTML={{ __html: renderRichToHtml(displayQuote.programme_notes_rich) }} />
          </div>
        ) : null}

        {displaySettings.show_payment_notes !== false && displayQuote?.payment_notes_rich ? (
          <div className="mt-4">
            <div className="text-sm font-semibold">Payments</div>
            <div className="text-sm" dangerouslySetInnerHTML={{ __html: renderRichToHtml(displayQuote.payment_notes_rich) }} />
          </div>
        ) : null}

        {displaySettings.show_warranty_notes !== false && displayQuote?.warranty_notes_rich ? (
          <div className="mt-4">
            <div className="text-sm font-semibold">Warranty</div>
            <div className="text-sm" dangerouslySetInnerHTML={{ __html: renderRichToHtml(displayQuote.warranty_notes_rich) }} />
          </div>
        ) : null}

        {displaySettings.show_inclusions_exclusions !== false && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm font-semibold">Inclusions</div>
              <ul className="text-sm list-disc pl-5">
                {inclusions.map((x: string, i: number) => <li key={i}>{x}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold">Exclusions</div>
              <ul className="text-sm list-disc pl-5">
                {exclusions.map((x: string, i: number) => <li key={i}>{x}</li>)}
              </ul>
            </div>
            {displaySettings.show_assumptions !== false && (
              <div>
                <div className="text-sm font-semibold">Assumptions</div>
                <ul className="text-sm list-disc pl-5">
                  {assumptions.map((x: string, i: number) => <li key={i}>{x}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {displaySettings.show_terms !== false && displayQuote?.terms_body_rich ? (
          <div className="mt-6">
            <div className="text-sm font-semibold">Terms & Conditions</div>
            <div className="text-sm" dangerouslySetInnerHTML={{ __html: renderRichToHtml(displayQuote.terms_body_rich) }} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

