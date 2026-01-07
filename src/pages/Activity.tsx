import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Activity() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">
          Complete audit trail of all system activities.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>System-wide activity tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Activity log will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

