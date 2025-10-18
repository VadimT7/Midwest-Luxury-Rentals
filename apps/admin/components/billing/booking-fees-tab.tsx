'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Percent, TrendingDown, Info } from 'lucide-react';

interface DashboardStats {
  plan: string;
  planStartedAt: string;
  performanceEndsAt: string | null;
  daysLeftInPerformance: number;
  currentFeePercent: number;
}

export default function BookingFeesTab() {
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

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3" />
          </CardHeader>
          <CardContent className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const feeSchedule = [
    {
      plan: 'Performance',
      period: 'First 60 days',
      fee: '7%',
      subscription: '$0/mo',
      active: stats.plan === 'PERFORMANCE' && stats.daysLeftInPerformance > 0,
    },
    {
      plan: 'Starter',
      period: 'After Performance or anytime',
      fee: '4%',
      subscription: '$399/mo',
      active: stats.plan === 'STARTER',
    },
    {
      plan: 'Pro',
      period: 'Premium tier',
      fee: '1%',
      subscription: '$999/mo',
      active: stats.plan === 'PRO',
    }
  ];

  return (
    <div className="space-y-6">
      {/* Current Fee Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-900">Current Fee Rate</CardTitle>
              <CardDescription className="text-blue-800">
                Active on all new bookings
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-900">
                {stats.currentFeePercent}%
              </div>
              <Badge className="mt-2 bg-blue-100 text-blue-800">
                {stats.plan}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {stats.plan === 'PERFORMANCE' && stats.performanceEndsAt && stats.daysLeftInPerformance > 0 && (
            <div className="flex items-center gap-2 text-sm text-blue-900">
              <Calendar className="h-4 w-4" />
              <span>
                Performance period ends on{' '}
                <strong>{new Date(stats.performanceEndsAt).toLocaleDateString()}</strong>
                {' '}({stats.daysLeftInPerformance} days remaining)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Schedule */}
      <div>
        <h3 className="text-xl font-bold mb-4">Fee Schedule</h3>
        <div className="grid gap-4">
          {feeSchedule.map((item, index) => (
            <Card
              key={index}
              className={item.active ? 'border-green-500 border-2' : ''}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg">{item.plan}</h4>
                      {item.active && (
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.period}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2 justify-end">
                      <Percent className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">{item.fee}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">+ {item.subscription}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How Fees Work */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How Marketplace Fees Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Automatic Deduction</p>
            <p className="text-muted-foreground mt-1">
              Marketplace fees are automatically deducted from each booking payment before funds are
              transferred to your payout account. You don't need to do anything.
            </p>
          </div>
          <div>
            <p className="font-medium">Transparent Calculation</p>
            <p className="text-muted-foreground mt-1">
              Fees are calculated as a percentage of the total booking amount (including add-ons and taxes).
              You can see the breakdown in each booking's payment details.
            </p>
          </div>
          <div>
            <p className="font-medium">Lower Fees with Upgrades</p>
            <p className="text-muted-foreground mt-1">
              Upgrade to Starter or Pro plans to reduce your per-booking fees. For high-volume businesses,
              the subscription cost is offset by lower marketplace fees.
            </p>
          </div>
          <div>
            <p className="font-medium">Refund Handling</p>
            <p className="text-muted-foreground mt-1">
              When you issue a refund, the marketplace fee is automatically refunded proportionally.
              You never pay fees on refunded amounts.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fee Optimization Tips */}
      {stats.plan === 'PERFORMANCE' && (
        <Alert>
          <TrendingDown className="h-4 w-4" />
          <AlertDescription>
            <strong>Optimize Your Fees:</strong> After your Performance period, fees drop to 2%. For even
            lower fees (1%), consider upgrading to Pro. On $50,000/month in bookings, Pro saves you $500/month
            compared to Starter.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
