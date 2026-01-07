import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default function Calendar() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage your schedule, meetings, and deadlines.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>Your upcoming events and appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Calendar view will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

