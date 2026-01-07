import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Email() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email</h1>
        <p className="text-muted-foreground">
          Outlook-style email client built into the system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email</CardTitle>
          <CardDescription>Your email inbox</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Email interface will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

