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

export function WorkOrderPdf({ workOrder, lines }: { workOrder: any; lines: any[] }) {
  const money = (n: any) => `£${Number(n || 0).toFixed(2)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Work Order</Text>
        <Text style={styles.text}>Title: {workOrder.title}</Text>
        <Text style={styles.text}>Status: {workOrder.status}</Text>
        <Text style={styles.text}>Contractor: {workOrder.assigned_to_name || '—'}</Text>

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
          <Text>Subtotal: {money(workOrder.subtotal)}</Text>
          <Text>VAT ({workOrder.vat_rate}%): {money(workOrder.vat_amount)}</Text>
          <Text style={styles.total}>Total: {money(workOrder.total)}</Text>
        </View>

        <View style={styles.notes}>
          <Text>
            Notes: This work order is issued as an instruction to proceed. Any variations should be confirmed in writing and may be subject to a revised price/programme.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

