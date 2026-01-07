import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Financial() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial</h1>
        <p className="text-muted-foreground">
          Financial management with integration to Xero, FreeAgent, QuickBooks, and more.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Dashboard</CardTitle>
          <CardDescription>Financial overview and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Financial dashboard will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

