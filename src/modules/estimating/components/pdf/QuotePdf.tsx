import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import { ensureDocJson } from '../rich/tiptapHelpers';
import type { QuoteDisplaySettings } from '../QuoteDisplaySettings';

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

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 11,
  },
  title: {
    fontSize: 16,
    marginBottom: 6,
  },
  text: {
    marginBottom: 2,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  item: {
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 10,
  },
  itemDesc: {
    fontSize: 9,
    color: '#666',
  },
  totals: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 8,
  },
  total: {
    fontSize: 12,
  },
  notes: {
    marginTop: 10,
  },
  notesTitle: {
    fontSize: 12,
  },
  list: {
    marginTop: 4,
  },
  listItem: {
    fontSize: 9,
    marginBottom: 2,
  },
});

export function QuotePdf({
  estimate,
  quote,
  sections,
  items,
}: {
  estimate: any;
  quote: any;
  sections: any[];
  items: any[];
}) {
  const money = (n: any) => `£${Number(n || 0).toFixed(2)}`;
  const displaySettings = parseDisplaySettings(quote?.display_settings);

  const visibleSections = (sections ?? []).filter((s: any) => s.is_client_visible);
  let visibleItems = (items ?? []).filter((i: any) => i.is_client_visible);

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

  const bySection: Record<string, any[]> = {};
  for (const it of visibleItems) {
    const sid = it.section_id || '__none__';
    bySection[sid] = bySection[sid] || [];
    bySection[sid].push(it);
  }

  const inclusions = Array.isArray(quote?.inclusions) ? quote.inclusions : typeof quote?.inclusions === 'string' ? JSON.parse(quote.inclusions || '[]') : [];
  const exclusions = Array.isArray(quote?.exclusions) ? quote.exclusions : typeof quote?.exclusions === 'string' ? JSON.parse(quote.exclusions || '[]') : [];
  const assumptions = Array.isArray(quote?.assumptions) ? quote.assumptions : typeof quote?.assumptions === 'string' ? JSON.parse(quote.assumptions || '[]') : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{quote?.intro_title || 'Quotation'}</Text>
        <Text style={styles.text}>Project: {estimate?.title || ''}</Text>
        <Text style={styles.text}>Date: {new Date().toLocaleDateString('en-GB')}</Text>

        <Text style={{ marginBottom: 12 }}>
          {generateHTML(ensureDocJson(quote?.intro_body_rich), [StarterKit]).replace(/<[^>]*>/g, ' ').trim() || ''}
        </Text>

        {visibleSections.map((s: any) => {
          const sectionItems = bySection[s.id] ?? [];
          const sectionTotal = sectionItems.reduce((sum: number, it: any) => sum + (Number(it.line_total) || 0), 0);
          const sectionDisplayMode = displaySettings.section_display_mode ?? 'expanded';
          const isCollapsed = sectionDisplayMode === 'collapsed';
          const isSummaryOnly = sectionDisplayMode === 'summary_only';

          return (
            <View key={s.id} style={styles.section}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.sectionTitle}>{s.title}</Text>
                {displaySettings.show_section_totals && sectionItems.length > 0 && (
                  <Text style={styles.itemDesc}>{money(sectionTotal)}</Text>
                )}
              </View>
              {displaySettings.show_client_narratives !== false && s.client_narrative_rich ? (
                <Text style={styles.itemDesc}>
                  {generateHTML(ensureDocJson(s.client_narrative_rich), [StarterKit]).replace(/<[^>]*>/g, ' ').trim()}
                </Text>
              ) : null}
              {!isCollapsed && !isSummaryOnly && (quote?.show_section_details !== false) && sectionItems.map((it: any) => {
                const itemDisplayMode = displaySettings.item_display_mode ?? 'detailed';
                const isMinimal = itemDisplayMode === 'minimal';
                const isSummary = itemDisplayMode === 'summary';

                return (
                  <View key={it.id} style={styles.item}>
                    <Text style={styles.itemTitle}>{it.title}</Text>
                    {!isMinimal && displaySettings.show_descriptions !== false && it.description ? (
                      <Text style={styles.itemDesc}>{it.description}</Text>
                    ) : null}
                    {!isMinimal && displaySettings.show_pricing_breakdown !== false && quote?.show_pricing_breakdown ? (
                      <Text style={styles.itemDesc}>
                        {displaySettings.show_quantities !== false && `${it.quantity} ${it.unit}`}
                        {displaySettings.show_unit_prices !== false && ` × ${money(it.unit_price)}`}
                        {displaySettings.show_line_totals !== false && ` = ${money(it.line_total)}`}
                      </Text>
                    ) : null}
                    {isSummary && displaySettings.show_line_totals !== false && (
                      <Text style={styles.itemDesc}>{money(it.line_total)}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        {displaySettings.show_pricing_summary !== false && (
          <View style={styles.totals}>
            <Text>Subtotal: {money(estimate?.subtotal || 0)}</Text>
            {displaySettings.show_vat !== false && (
              <Text>VAT ({estimate?.vat_rate || 0}%): {money(estimate?.vat_amount || 0)}</Text>
            )}
            <Text style={styles.total}>Total: {money(estimate?.total || 0)}</Text>
          </View>
        )}

        {displaySettings.show_programme_notes !== false && quote?.programme_notes_rich ? (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Programme / Timeline</Text>
            <Text>{generateHTML(ensureDocJson(quote.programme_notes_rich), [StarterKit]).replace(/<[^>]*>/g, ' ').trim()}</Text>
          </View>
        ) : null}

        {displaySettings.show_payment_notes !== false && quote?.payment_notes_rich ? (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Payments</Text>
            <Text>{generateHTML(ensureDocJson(quote.payment_notes_rich), [StarterKit]).replace(/<[^>]*>/g, ' ').trim()}</Text>
          </View>
        ) : null}

        {displaySettings.show_warranty_notes !== false && quote?.warranty_notes_rich ? (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Warranty</Text>
            <Text>{generateHTML(ensureDocJson(quote.warranty_notes_rich), [StarterKit]).replace(/<[^>]*>/g, ' ').trim()}</Text>
          </View>
        ) : null}

        {displaySettings.show_inclusions_exclusions !== false && (
          <>
            <View style={styles.notes}>
              <Text style={styles.notesTitle}>Inclusions</Text>
              <View style={styles.list}>
                {inclusions.slice(0, 30).map((x: string, i: number) => (
                  <Text key={i} style={styles.listItem}>• {x}</Text>
                ))}
              </View>
            </View>

            <View style={styles.notes}>
              <Text style={styles.notesTitle}>Exclusions</Text>
              <View style={styles.list}>
                {exclusions.slice(0, 30).map((x: string, i: number) => (
                  <Text key={i} style={styles.listItem}>• {x}</Text>
                ))}
              </View>
            </View>

            {displaySettings.show_assumptions !== false && (
              <View style={styles.notes}>
                <Text style={styles.notesTitle}>Assumptions</Text>
                <View style={styles.list}>
                  {assumptions.slice(0, 30).map((x: string, i: number) => (
                    <Text key={i} style={styles.listItem}>• {x}</Text>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {displaySettings.show_terms !== false && quote?.terms_body_rich ? (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Terms & Conditions</Text>
            <Text>{generateHTML(ensureDocJson(quote.terms_body_rich), [StarterKit]).replace(/<[^>]*>/g, ' ').trim()}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

