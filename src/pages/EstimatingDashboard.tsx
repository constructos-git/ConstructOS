import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  Plus,
  TrendingUp,
  Calculator,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  ArrowRight,
  PoundSterling,
  Send,
  Archive,
  Target,
  FolderKanban,
  LayoutDashboard,
  List,
} from 'lucide-react';
import { estimatesRepo } from '@/modules/estimating/data/estimates.repo';
import type { Estimate, EstimateStatus } from '@/modules/estimating/domain/estimating.types';
import { format } from 'date-fns';
import { EstimatesPage } from '@/modules/estimating/pages/EstimatesPage';

export default function EstimatingDashboard() {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const loadEstimates = async () => {
      try {
        setIsLoading(true);
        const data = await estimatesRepo.list();
        setEstimates(data);
      } catch (error) {
        console.error('Failed to load estimates:', error);
        setEstimates([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEstimates();
  }, []);

  // Calculate metrics
  const totalEstimates = estimates.length;
  const draftEstimates = estimates.filter((e) => e.status === 'draft').length;
  const sentEstimates = estimates.filter((e) => e.status === 'sent').length;
  const acceptedEstimates = estimates.filter((e) => e.status === 'accepted').length;
  const rejectedEstimates = estimates.filter((e) => e.status === 'rejected').length;
  const wonEstimates = estimates.filter((e) => e.status === 'won').length;
  const lostEstimates = estimates.filter((e) => e.status === 'lost').length;
  const archivedEstimates = estimates.filter((e) => e.status === 'archived').length;

  const totalValue = estimates.reduce((sum, e) => sum + (e.total || 0), 0);
  const pendingValue = estimates
    .filter((e) => ['draft', 'sent'].includes(e.status))
    .reduce((sum, e) => sum + (e.total || 0), 0);
  const acceptedValue = estimates
    .filter((e) => ['accepted', 'won'].includes(e.status))
    .reduce((sum, e) => sum + (e.total || 0), 0);
  const rejectedValue = estimates
    .filter((e) => e.status === 'rejected' || e.status === 'lost')
    .reduce((sum, e) => sum + (e.total || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Recent estimates (last 5)
  const recentEstimates = estimates
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  // Estimates needing attention (draft or sent for more than 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const needsAttention = estimates.filter((e) => {
    if (!['draft', 'sent'].includes(e.status)) return false;
    const updatedDate = new Date(e.updated_at);
    return updatedDate < sevenDaysAgo;
  });

  // Upcoming deadlines (estimates with status 'sent' that might need follow-up)
  const upcomingFollowUps = estimates.filter((e) => e.status === 'sent').slice(0, 3);

  const getStatusColor = (status: EstimateStatus) => {
    const colors: Record<EstimateStatus, string> = {
      draft: 'bg-gray-500',
      sent: 'bg-blue-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500',
      won: 'bg-green-600',
      lost: 'bg-red-600',
      archived: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: EstimateStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary-500 via-accent-500 to-purple-500 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Estimating Dashboard</h1>
              <p className="mt-2 text-primary-50">
                Overview of all estimates, quotes, and pricing activities.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => navigate('/estimating')}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Estimate
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-accent-600/20 to-purple-600/20" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="estimates" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Estimates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => setActiveTab('estimates')}
          className="relative overflow-hidden rounded-lg border-0 bg-background shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-500/10 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estimates</CardTitle>
            <div className="rounded-full bg-gradient-to-br from-green-500 to-teal-500 p-2">
              <Calculator className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{totalEstimates}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-semibold">
                {draftEstimates} draft, {sentEstimates} sent
              </span>
            </p>
          </CardContent>
        </button>

        <button
          onClick={() => setActiveTab('estimates')}
          className="relative overflow-hidden rounded-lg border-0 bg-background shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-accent-500/10 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <div className="rounded-full bg-gradient-to-br from-teal-500 to-accent-500 p-2">
              <PoundSterling className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-teal-600 font-semibold">
                {formatCurrency(acceptedValue)} accepted
              </span>
            </p>
          </CardContent>
        </button>

        <button
          onClick={() => setActiveTab('estimates')}
          className="relative overflow-hidden rounded-lg border-0 bg-background shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 via-purple-500/10 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Value</CardTitle>
            <div className="rounded-full bg-gradient-to-br from-accent-500 to-purple-500 p-2">
              <Send className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{formatCurrency(pendingValue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent-600 font-semibold">
                {draftEstimates + sentEstimates} estimates
              </span>
            </p>
          </CardContent>
        </button>

        <button
          onClick={() => setActiveTab('estimates')}
          className="relative overflow-hidden rounded-lg border-0 bg-background shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-2">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">
              {wonEstimates + lostEstimates > 0
                ? `${Math.round((wonEstimates / (wonEstimates + lostEstimates)) * 100)}%`
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-purple-600 font-semibold">
                {wonEstimates} won, {lostEstimates} lost
              </span>
            </p>
          </CardContent>
        </button>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => setActiveTab('estimates')}
          className="relative overflow-hidden rounded-lg border bg-background transition-all hover:scale-105 hover:shadow-lg cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{acceptedEstimates}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(acceptedValue)}</p>
          </CardContent>
        </button>

        <button
          onClick={() => setActiveTab('estimates')}
          className="relative overflow-hidden rounded-lg border bg-background transition-all hover:scale-105 hover:shadow-lg cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{rejectedEstimates + lostEstimates}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(rejectedValue)}</p>
          </CardContent>
        </button>

        <button
          onClick={() => setActiveTab('estimates')}
          className="relative overflow-hidden rounded-lg border bg-background transition-all hover:scale-105 hover:shadow-lg cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Send className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{sentEstimates}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </button>

        <button
          onClick={() => setActiveTab('estimates')}
          className="relative overflow-hidden rounded-lg border bg-background transition-all hover:scale-105 hover:shadow-lg cursor-pointer text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400/5 to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{draftEstimates}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Estimates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Estimates</CardTitle>
            <CardDescription>Latest estimate activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading estimates...</div>
              ) : recentEstimates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No estimates yet</div>
              ) : (
                recentEstimates.map((estimate) => (
                  <button
                    key={estimate.id}
                    onClick={() => navigate(`/estimating/${estimate.id}`)}
                    className="flex w-full items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500">
                      <Receipt className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{estimate.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {estimate.reference && `Ref: ${estimate.reference} • `}
                        {formatCurrency(estimate.total)} • {format(new Date(estimate.updated_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(estimate.status)}>
                      {getStatusLabel(estimate.status)}
                    </Badge>
                  </button>
                ))
              )}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setActiveTab('estimates')}
              >
                View All Estimates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common estimating tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/estimating')}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Estimate
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/estimate-builder-ai')}
              >
                <Plus className="mr-2 h-4 w-4" />
                AI Estimate Builder
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setActiveTab('estimates')}
              >
                <FileText className="mr-2 h-4 w-4" />
                View All Estimates
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/opportunities')}
              >
                <Target className="mr-2 h-4 w-4" />
                Link to Opportunity
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/projects')}
              >
                <FolderKanban className="mr-2 h-4 w-4" />
                Link to Project
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estimates Needing Attention */}
        {needsAttention.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Needs Attention</CardTitle>
              <CardDescription>Estimates requiring follow-up</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {needsAttention.slice(0, 3).map((estimate) => (
                  <button
                    key={estimate.id}
                    onClick={() => navigate(`/estimating/${estimate.id}`)}
                    className="flex w-full items-start gap-3 rounded-lg border-l-4 border-accent-500 bg-accent-50/50 p-3 transition-colors hover:bg-accent-100/70 dark:bg-accent-950/20 dark:hover:bg-accent-950/40 text-left"
                  >
                    <AlertCircle className="h-5 w-5 text-accent-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{estimate.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {getStatusLabel(estimate.status)} • Updated {format(new Date(estimate.updated_at), 'MMM d')}
                      </p>
                    </div>
                  </button>
                ))}
                {needsAttention.length > 3 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setActiveTab('estimates')}
                  >
                    View All ({needsAttention.length})
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estimate Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Distribution of estimates by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button
                onClick={() => setActiveTab('estimates')}
                className="w-full rounded-lg p-3 transition-colors hover:bg-accent text-left"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">Draft</span>
                  <span className="font-semibold">{draftEstimates}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-gray-500 to-gray-600 transition-all"
                    style={{ width: `${totalEstimates > 0 ? (draftEstimates / totalEstimates) * 100 : 0}%` }}
                  />
                </div>
              </button>
              <button
                onClick={() => setActiveTab('estimates')}
                className="w-full rounded-lg p-3 transition-colors hover:bg-accent text-left"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">Sent</span>
                  <span className="font-semibold">{sentEstimates}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                    style={{ width: `${totalEstimates > 0 ? (sentEstimates / totalEstimates) * 100 : 0}%` }}
                  />
                </div>
              </button>
              <button
                onClick={() => setActiveTab('estimates')}
                className="w-full rounded-lg p-3 transition-colors hover:bg-accent text-left"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">Accepted/Won</span>
                  <span className="font-semibold">{acceptedEstimates + wonEstimates}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                    style={{
                      width: `${totalEstimates > 0 ? ((acceptedEstimates + wonEstimates) / totalEstimates) * 100 : 0}%`,
                    }}
                  />
                </div>
              </button>
              <button
                onClick={() => setActiveTab('estimates')}
                className="w-full rounded-lg p-3 transition-colors hover:bg-accent text-left"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">Rejected/Lost</span>
                  <span className="font-semibold">{rejectedEstimates + lostEstimates}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all"
                    style={{
                      width: `${totalEstimates > 0 ? ((rejectedEstimates + lostEstimates) / totalEstimates) * 100 : 0}%`,
                    }}
                  />
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Financial Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Estimate Activity</CardTitle>
            <CardDescription>Latest estimate updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : recentEstimates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No recent activity</div>
              ) : (
                recentEstimates.slice(0, 3).map((estimate) => (
                  <button
                    key={estimate.id}
                    onClick={() => navigate(`/estimating/${estimate.id}`)}
                    className="flex w-full items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500">
                        <Receipt className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{estimate.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {estimate.reference && `Ref: ${estimate.reference} • `}
                          Updated {format(new Date(estimate.updated_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(estimate.total)}</p>
                      <Badge className={`mt-1 ${getStatusColor(estimate.status)}`}>
                        {getStatusLabel(estimate.status)}
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="estimates" className="mt-6">
          <EstimatesPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
