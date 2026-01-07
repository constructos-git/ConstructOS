import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  Plus,
  TrendingUp,
  Users,
  FolderKanban,
  Target,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary-500 via-accent-500 to-purple-500 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="mt-2 text-primary-50">
                Welcome back! Here's what's happening with your business.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => navigate('/projects')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Quick Action
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-accent-600/20 to-purple-600/20" />
      </div>

      {/* Key Metrics with Gradient Accents */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => navigate('/opportunities')}
          className="relative overflow-hidden rounded-lg border-0 bg-background shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-500/10 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <div className="rounded-full bg-gradient-to-br from-green-500 to-teal-500 p-2">
              <Target className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-semibold">+12%</span> from last month
            </p>
          </CardContent>
        </button>

        <button
          onClick={() => navigate('/projects')}
          className="relative overflow-hidden rounded-lg border-0 bg-background shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-accent-500/10 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <div className="rounded-full bg-gradient-to-br from-teal-500 to-accent-500 p-2">
              <FolderKanban className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-teal-600 font-semibold">+3</span> this week
            </p>
          </CardContent>
        </button>

        <button
          onClick={() => navigate('/contacts/clients')}
          className="relative overflow-hidden rounded-lg border-0 bg-background shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 via-purple-500/10 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <div className="rounded-full bg-gradient-to-br from-accent-500 to-purple-500 p-2">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent-600 font-semibold">+8</span> new this month
            </p>
          </CardContent>
        </button>

        <button
          onClick={() => navigate('/financial')}
          className="relative overflow-hidden rounded-lg border-0 bg-background shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-2">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">£245,890</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-purple-600 font-semibold">+18.2%</span> from last month
            </p>
          </CardContent>
        </button>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => navigate('/invoices')}
          className="relative overflow-hidden rounded-lg border bg-background transition-all hover:scale-105 hover:shadow-lg cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">£45,230 pending</p>
          </CardContent>
        </button>

        <button
          onClick={() => navigate('/financial/estimates')}
          className="relative overflow-hidden rounded-lg border bg-background transition-all hover:scale-105 hover:shadow-lg cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimates</CardTitle>
            <Receipt className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">£32,150 total value</p>
          </CardContent>
        </button>

        <button
          onClick={() => navigate('/calendar')}
          className="relative overflow-hidden rounded-lg border bg-background transition-all hover:scale-105 hover:shadow-lg cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-400/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-accent-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </button>

        <button
          onClick={() => navigate('/messages')}
          className="relative overflow-hidden rounded-lg border bg-background transition-all hover:scale-105 hover:shadow-lg cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">3 in email</p>
          </CardContent>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/projects')}
                className="flex w-full items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">New project "Office Renovation" created</p>
                  <p className="text-xs text-muted-foreground">2 hours ago • Project Manager</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/invoices')}
                className="flex w-full items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-accent-500">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Invoice #1234 sent to ABC Construction</p>
                  <p className="text-xs text-muted-foreground">5 hours ago • £12,450</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/opportunities')}
                className="flex w-full items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-purple-500">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">New opportunity "Warehouse Build" added</p>
                  <p className="text-xs text-muted-foreground">1 day ago • £85,000 value</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/contacts/clients')}
                className="flex w-full items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">New client "Smith & Co" added</p>
                  <p className="text-xs text-muted-foreground">2 days ago • Contact added</p>
                </div>
              </button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/activity')}
              >
                View All Activity
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/projects')}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/opportunities')}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Opportunity
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/invoices')}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/contacts')}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Contact
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/financial/estimates')}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Estimate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Tasks and milestones due soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/calendar')}
                className="flex w-full items-start gap-3 rounded-lg border-l-4 border-green-500 bg-green-50/50 p-3 transition-colors hover:bg-green-100/70 dark:bg-green-950/20 dark:hover:bg-green-950/40 text-left"
              >
                <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Project Review Meeting</p>
                  <p className="text-xs text-muted-foreground">Today at 2:00 PM</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/invoices')}
                className="flex w-full items-start gap-3 rounded-lg border-l-4 border-teal-500 bg-teal-50/50 p-3 transition-colors hover:bg-teal-100/70 dark:bg-teal-950/20 dark:hover:bg-teal-950/40 text-left"
              >
                <FileText className="h-5 w-5 text-teal-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Invoice #1235 Due</p>
                  <p className="text-xs text-muted-foreground">Tomorrow</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/financial/estimates')}
                className="flex w-full items-start gap-3 rounded-lg border-l-4 border-accent-500 bg-accent-50/50 p-3 transition-colors hover:bg-accent-100/70 dark:bg-accent-950/20 dark:hover:bg-accent-950/40 text-left"
              >
                <AlertCircle className="h-5 w-5 text-accent-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Estimate Approval</p>
                  <p className="text-xs text-muted-foreground">In 2 days</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Overview of active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/projects')}
                className="w-full rounded-lg p-3 transition-colors hover:bg-accent text-left"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">In Progress</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted cursor-pointer">
                  <div className="h-full w-[60%] bg-gradient-to-r from-green-500 to-teal-500 transition-all hover:w-[65%]" />
                </div>
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="w-full rounded-lg p-3 transition-colors hover:bg-accent text-left"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">On Hold</span>
                  <span className="font-semibold">4</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted cursor-pointer">
                  <div className="h-full w-[20%] bg-gradient-to-r from-teal-500 to-accent-500 transition-all hover:w-[25%]" />
                </div>
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="w-full rounded-lg p-3 transition-colors hover:bg-accent text-left"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">Completed</span>
                  <span className="font-semibold">2</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted cursor-pointer">
                  <div className="h-full w-[10%] bg-gradient-to-r from-accent-500 to-purple-500 transition-all hover:w-[15%]" />
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications & Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Important alerts and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/invoices')}
                className="flex w-full items-start gap-3 rounded-lg border-l-4 border-green-500 bg-green-50/50 p-3 transition-colors hover:bg-green-100/70 dark:bg-green-950/20 dark:hover:bg-green-950/40 text-left"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment Received</p>
                  <p className="text-xs text-muted-foreground">Invoice #1234 paid</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/opportunities')}
                className="flex w-full items-start gap-3 rounded-lg border-l-4 border-teal-500 bg-teal-50/50 p-3 transition-colors hover:bg-teal-100/70 dark:bg-teal-950/20 dark:hover:bg-teal-950/40 text-left"
              >
                <Target className="h-5 w-5 text-teal-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New Opportunity</p>
                  <p className="text-xs text-muted-foreground">High-value lead added</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/invoices')}
                className="flex w-full items-start gap-3 rounded-lg border-l-4 border-accent-500 bg-accent-50/50 p-3 transition-colors hover:bg-accent-100/70 dark:bg-accent-950/20 dark:hover:bg-accent-950/40 text-left"
              >
                <AlertCircle className="h-5 w-5 text-accent-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Overdue Invoice</p>
                  <p className="text-xs text-muted-foreground">Action required</p>
                </div>
              </button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/activity')}
              >
                View All Notifications
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Financial Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Financial Activity</CardTitle>
            <CardDescription>Latest invoices and estimates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/invoices')}
                className="flex w-full items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Invoice #1234</p>
                    <p className="text-xs text-muted-foreground">ABC Construction • Sent</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">£12,450</p>
                  <Badge variant="success" className="mt-1">Paid</Badge>
                </div>
              </button>
              <button
                onClick={() => navigate('/financial/estimates')}
                className="flex w-full items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-accent-500">
                    <Receipt className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Estimate #E-0456</p>
                    <p className="text-xs text-muted-foreground">Smith & Co • Pending</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">£8,750</p>
                  <Badge variant="secondary" className="mt-1">Pending</Badge>
                </div>
              </button>
              <button
                onClick={() => navigate('/invoices')}
                className="flex w-full items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-purple-500">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Invoice #1233</p>
                    <p className="text-xs text-muted-foreground">XYZ Builders • Overdue</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">£24,890</p>
                  <Badge variant="destructive" className="mt-1">Overdue</Badge>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Team Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Team Activity</CardTitle>
            <CardDescription>Recent team updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/projects')}
                className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500 text-xs font-semibold text-white">
                  JD
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Updated project status</p>
                </div>
                <span className="text-xs text-muted-foreground">5m</span>
              </button>
              <button
                onClick={() => navigate('/invoices')}
                className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-accent-500 text-xs font-semibold text-white">
                  SM
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Sarah Miller</p>
                  <p className="text-xs text-muted-foreground">Created new invoice</p>
                </div>
                <span className="text-xs text-muted-foreground">1h</span>
              </button>
              <button
                onClick={() => navigate('/contacts')}
                className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-purple-500 text-xs font-semibold text-white">
                  MB
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Mike Brown</p>
                  <p className="text-xs text-muted-foreground">Added new contact</p>
                </div>
                <span className="text-xs text-muted-foreground">2h</span>
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-semibold text-white">
                  AL
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Alex Lee</p>
                  <p className="text-xs text-muted-foreground">Completed task</p>
                </div>
                <span className="text-xs text-muted-foreground">3h</span>
              </button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/activity')}
              >
                View All Team Activity
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

