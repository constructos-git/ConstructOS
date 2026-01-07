import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Clients() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground">Manage your client contacts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Contacts</CardTitle>
          <CardDescription>View and manage all client contacts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Client management interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}


