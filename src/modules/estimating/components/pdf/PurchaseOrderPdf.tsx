import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingTop: 6,
    paddingBottom: 6,
    marginBottom: 8,
  },
  lineItem: {
    marginBottom: 6,
  },
  lineTitle: {
    fontSize: 12,
  },
  totals: {
    marginTop: 12,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  total: {
    fontSize: 12,
  },
  notes: {
    marginTop: 12,
    fontSize: 9,
  },
});

export function PurchaseOrderPdf({ purchaseOrder, lines }: { purchaseOrder: any; lines: any[] }) {
  const money = (n: any) => `£${Number(n || 0).toFixed(2)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Purchase Order</Text>
        <Text style={styles.text}>Title: {purchaseOrder.title}</Text>
        <Text style={styles.text}>Status: {purchaseOrder.status}</Text>
        <Text style={styles.text}>Supplier: {purchaseOrder.supplier_name || '—'}</Text>
        <Text style={styles.text}>Delivery: {purchaseOrder.delivery_address || '—'}</Text>

        <View style={styles.section}>
          <Text>Lines</Text>
        </View>

        {lines.map((l: any) => (
          <View key={l.id} style={styles.lineItem}>
            <Text style={styles.lineTitle}>{l.title}</Text>
            <Text>Qty: {l.quantity} {l.unit} • Unit cost: {money(l.unit_cost)} • Line cost: {money(l.line_cost)}</Text>
          </View>
        ))}

        <View style={styles.totals}>
          <Text>Subtotal: {money(purchaseOrder.subtotal)}</Text>
          <Text>VAT ({purchaseOrder.vat_rate}%): {money(purchaseOrder.vat_amount)}</Text>
          <Text style={styles.total}>Total: {money(purchaseOrder.total)}</Text>
        </View>

        <View style={styles.notes}>
          <Text>
            Notes: This purchase order is issued subject to supplier confirmation of availability, delivery dates, and any lead times. Please confirm any substitutions prior to dispatch.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

