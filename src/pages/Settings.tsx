import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';

export default function Settings() {
  const { mode, setMode } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the appearance of the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Theme</label>
              <div className="flex gap-2">
                <Button
                  variant={mode === 'light' ? 'primary' : 'outline'}
                  onClick={() => setMode('light')}
                >
                  Light
                </Button>
                <Button
                  variant={mode === 'dark' ? 'primary' : 'outline'}
                  onClick={() => setMode('dark')}
                >
                  Dark
                </Button>
                <Button
                  variant={mode === 'auto' ? 'primary' : 'outline'}
                  onClick={() => setMode('auto')}
                >
                  Auto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Update your account information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Name" placeholder="Your name" />
            <Input label="Email" type="email" placeholder="your@email.com" />
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

