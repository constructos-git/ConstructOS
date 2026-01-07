import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Contractors() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contractors</h1>
        <p className="text-muted-foreground">Manage your contractor contacts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contractor Contacts</CardTitle>
          <CardDescription>View and manage all contractor contacts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Contractor management interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}


