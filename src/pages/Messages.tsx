import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Messages() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          WhatsApp-style messaging with groups, project channels, and company chats.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>Your conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Messages interface will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

