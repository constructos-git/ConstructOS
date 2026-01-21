import { TrendingUp, Target, PoundSterling, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { OpportunityMetrics } from '@/types/opportunities';

interface OpportunityMetricsProps {
  metrics: OpportunityMetrics;
}

export default function OpportunityMetrics({ metrics }: OpportunityMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden border-0 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-500/10 to-transparent" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
          <div className="rounded-full bg-gradient-to-br from-green-500 to-teal-500 p-2">
            <Target className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold">{metrics.total}</div>
          <p className="text-xs text-muted-foreground mt-1">Across all stages</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-accent-500/10 to-transparent" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
          <div className="rounded-full bg-gradient-to-br from-teal-500 to-accent-500 p-2">
            <PoundSterling className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</div>
          <p className="text-xs text-muted-foreground mt-1">Potential revenue</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 via-purple-500/10 to-transparent" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          <div className="rounded-full bg-gradient-to-br from-accent-500 to-purple-500 p-2">
            <Percent className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold">{metrics.winRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">Conversion rate</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
          <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-2">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold">{formatCurrency(metrics.averageDealSize)}</div>
          <p className="text-xs text-muted-foreground mt-1">Per opportunity</p>
        </CardContent>
      </Card>
    </div>
  );
}
