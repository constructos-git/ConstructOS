// PDF Export Component using react-pdf

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { CustomerEstimate, VisibilitySettings } from '../../domain/types';
import { formatCurrency } from '../../utils/money';

interface EstimatePdfRendererProps {
  estimate: CustomerEstimate;
  visibilitySettings: VisibilitySettings;
  clientName?: string;
  estimateTitle?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  clientInfo: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 8,
  },
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #e0e0e0',
    paddingVertical: 5,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 5,
  },
  tableCellRight: {
    flex: 1,
    paddingHorizontal: 5,
    textAlign: 'right',
  },
  totals: {
    marginTop: 20,
    borderTop: '2pt solid #000',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1pt solid #000',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export function EstimatePdfDocument({
  estimate,
  visibilitySettings,
  clientName,
  estimateTitle,
}: EstimatePdfRendererProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{estimateTitle || 'Estimate'}</Text>
          {clientName && (
            <View style={styles.clientInfo}>
              <Text>Client: {clientName}</Text>
            </View>
          )}
        </View>

        {estimate.sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.table}>
              {section.items.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  {visibilitySettings.showDescriptions && (
                    <View style={styles.tableCell}>
                      <Text>{item.title}</Text>
                      {item.description && (
                        <Text style={{ fontSize: 8, color: '#666' }}>{item.description}</Text>
                      )}
                    </View>
                  )}
                  {visibilitySettings.showQuantities && (
                    <View style={styles.tableCellRight}>
                      <Text>{item.quantity}</Text>
                    </View>
                  )}
                  {visibilitySettings.showUnits && (
                    <View style={styles.tableCellRight}>
                      <Text>{item.unit}</Text>
                    </View>
                  )}
                  {visibilitySettings.showLineTotals && (
                    <View style={styles.tableCellRight}>
                      <Text>
                        {formatCurrency(item.lineTotal || (item.quantity || 0) * (item.unitPrice || 0))}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            {visibilitySettings.showSectionTotals && section.sectionTotal && (
              <View style={styles.totalRow}>
                <Text>Section Total:</Text>
                <Text>{formatCurrency(section.sectionTotal)}</Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.totals}>
          {!visibilitySettings.showGrandTotalOnly && (
            <>
              <View style={styles.totalRow}>
                <Text>Subtotal:</Text>
                <Text>{formatCurrency(estimate.subtotal)}</Text>
              </View>
              {visibilitySettings.showVat && (
                <View style={styles.totalRow}>
                  <Text>VAT (20%):</Text>
                  <Text>{formatCurrency(estimate.vat)}</Text>
                </View>
              )}
            </>
          )}
          <View style={styles.totalRowFinal}>
            <Text>Total:</Text>
            <Text>
              {visibilitySettings.showTotalsWithVat
                ? formatCurrency(estimate.total)
                : formatCurrency(estimate.subtotal)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function generatePdfBlob(
  estimate: CustomerEstimate,
  visibilitySettings: VisibilitySettings,
  clientName?: string,
  estimateTitle?: string
): Promise<Blob> {
  const doc = (
    <EstimatePdfDocument
      estimate={estimate}
      visibilitySettings={visibilitySettings}
      clientName={clientName}
      estimateTitle={estimateTitle}
    />
  );
  return await pdf(doc).toBlob();
}

