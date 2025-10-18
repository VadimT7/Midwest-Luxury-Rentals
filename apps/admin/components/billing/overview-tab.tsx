'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

interface DashboardStats {
  plan: string;
  planStartedAt: string;
  performanceEndsAt: string | null;
  daysLeftInPerformance: number;
  currentFeePercent: number;
  mtdStats: {
    bookings: number;
    gmvCents: number;
    feesCents: number;
  };
  stripeCustomerId: string | null;
  cardOnFile: boolean;
}

export default function OverviewTab() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/billing/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load billing stats</AlertDescription>
      </Alert>
    );
  }

  // Ensure mtdStats exists with default values
  const mtdStats = stats.mtdStats || { bookings: 0, gmvCents: 0, feesCents: 0 };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      PERFORMANCE: 'bg-purple-100 text-purple-800',
      STARTER: 'bg-blue-100 text-blue-800',
      PRO: 'bg-green-100 text-green-800',
      DIY: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={colors[plan] || ''}>{plan}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Performance Banner */}
      {stats.plan === 'PERFORMANCE' && stats.daysLeftInPerformance > 0 && (
        <Alert className="border-purple-200 bg-purple-50">
          <Calendar className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-900">
            <strong>Performance Plan Active:</strong> You're paying{' '}
            <strong>{stats.currentFeePercent}%</strong> per booking until{' '}
            {new Date(stats.performanceEndsAt!).toLocaleDateString()} (
            {stats.daysLeftInPerformance} days left). No subscription fees during this period.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Cards for First-time Setup */}
      {!stats.stripeCustomerId && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900">Get Started with Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-900">
                  1
                </div>
                <span className="font-medium">Connect your payout account</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                  2
                </div>
                <span className="font-medium text-muted-foreground">
                  Choose your plan (or stay on Performance)
                </span>
              </div>
              {stats.plan === 'PERFORMANCE' && (
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                    3
                  </div>
                  <span className="font-medium text-muted-foreground">
                    Add a card on file (for future upgrades)
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/billing?tab=payouts">Connect Payouts</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/billing?tab=subscriptions">View Plans</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPlanBadge(stats.plan)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.currentFeePercent}% fee per booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MTD Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mtdStats.bookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MTD GMV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mtdStats.gmvCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gross Merchandise Value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MTD Platform Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mtdStats.feesCents)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fees collected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/billing?tab=payouts">Manage Payouts</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/billing?tab=subscriptions">Manage Subscription</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/billing?tab=fees">View Fee Schedule</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
