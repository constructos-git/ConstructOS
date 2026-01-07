import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default function KnowledgeBase() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Documentation and resources for your team.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base</CardTitle>
          <CardDescription>All articles and documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Knowledge base content will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

