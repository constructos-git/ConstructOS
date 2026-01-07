import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default function Integrations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect with external services like Xero, FreeAgent, QuickBooks, and more.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Integration
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>Connect your favorite tools</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Integrations list will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

