import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default function Contacts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage individual contacts linked to companies.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Contact
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
          <CardDescription>All contacts in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Contacts list will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

