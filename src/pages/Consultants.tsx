import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Consultants() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Consultants</h1>
        <p className="text-muted-foreground">Manage your consultant contacts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consultant Contacts</CardTitle>
          <CardDescription>View and manage all consultant contacts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Consultant management interface coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}


