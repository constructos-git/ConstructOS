import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Full project lifecycle tracking with tabs, notes, and collaboration.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>All active and completed projects</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Projects list will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

