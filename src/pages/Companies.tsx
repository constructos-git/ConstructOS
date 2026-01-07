import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default function Companies() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage client companies, subcontractor firms, and consultant agencies.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Company
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
          <CardDescription>All companies in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Companies list will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

