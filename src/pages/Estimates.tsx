import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default function Estimates() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
          <p className="text-muted-foreground">
            Create and manage project estimates.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Estimate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estimates</CardTitle>
          <CardDescription>All estimates in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Estimates list will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

