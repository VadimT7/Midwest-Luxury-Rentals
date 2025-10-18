'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { prisma } from '@valore/database';

interface Deposit {
  id: string;
  bookingId: string;
  amountCents: number;
  currency: string;
  status: string;
  capturedCents: number;
  expiresAt: string;
  createdAt: string;
  booking: {
    bookingNumber: string;
    car: {
      displayName: string;
    };
  };
}

export default function DepositsTab() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      // This would need a proper API endpoint in production
      // For now, showing the UI structure
      setDeposits([]);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureDeposit = async (depositId: string, amount?: number) => {
    if (!confirm('Capture this security deposit? The customer will be charged.')) {
      return;
    }

    setProcessing(depositId);
    try {
      const res = await fetch(`/api/billing/deposits/${depositId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'capture', amountCents: amount }),
      });

      if (res.ok) {
        toast.success('Deposit captured successfully');
        fetchDeposits();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to capture deposit');
      }
    } catch (error) {
      console.error('Error capturing deposit:', error);
      toast.error('Failed to capture deposit');
    } finally {
      setProcessing(null);
    }
  };

  const handleReleaseDeposit = async (depositId: string) => {
    if (!confirm('Release this security deposit? The hold will be removed.')) {
      return;
    }

    setProcessing(depositId);
    try {
      const res = await fetch(`/api/billing/deposits/${depositId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'release' }),
      });

      if (res.ok) {
        toast.success('Deposit released successfully');
        fetchDeposits();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to release deposit');
      }
    } catch (error) {
      console.error('Error releasing deposit:', error);
      toast.error('Failed to release deposit');
    } finally {
      setProcessing(null);
    }
  };

  const formatCurrency = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      AUTHORIZED: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      CAPTURED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      RELEASED: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
      CANCELED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      EXPIRED: { color: 'bg-amber-100 text-amber-800', icon: AlertCircle },
    };

    const { color, icon: Icon } = config[status] || config.AUTHORIZED;

    return (
      <Badge className={color}>
        <Icon className="mr-1 h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deposit Policy */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-blue-900">Security Deposit Policy</CardTitle>
          </div>
          <CardDescription className="text-blue-800">
            How security deposits work for your rentals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-900">
          <p>
            <strong>Authorization:</strong> A hold is placed on the customer's card without charging them.
            The amount is not collected unless you capture it.
          </p>
          <p>
            <strong>Duration:</strong> Authorizations expire after 7 days. Capture or release before expiry.
          </p>
          <p>
            <strong>Release:</strong> Always release deposits promptly when the rental ends without issues.
            This builds trust with customers.
          </p>
          <p>
            <strong>Capture:</strong> Only capture deposits when there's actual damage or extra charges.
            You can capture a partial amount.
          </p>
        </CardContent>
      </Card>

      {/* Active Deposits */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Active Deposits</h3>
          <Button variant="outline" size="sm" onClick={fetchDeposits}>
            Refresh
          </Button>
        </div>

        {deposits.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No active security deposits. Deposits will appear here when bookings include them.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {deposits.map((deposit) => (
              <Card key={deposit.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Booking #{deposit.booking.bookingNumber}
                      </CardTitle>
                      <CardDescription>
                        {deposit.booking.car.displayName}
                      </CardDescription>
                    </div>
                    {getStatusBadge(deposit.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Authorized Amount</p>
                      <p className="font-medium">
                        {formatCurrency(deposit.amountCents, deposit.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Captured Amount</p>
                      <p className="font-medium">
                        {formatCurrency(deposit.capturedCents, deposit.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expires</p>
                      <p className="font-medium">
                        {new Date(deposit.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {new Date(deposit.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {deposit.status === 'AUTHORIZED' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleCaptureDeposit(deposit.id)}
                        disabled={processing === deposit.id}
                      >
                        {processing === deposit.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Capture Full Amount'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReleaseDeposit(deposit.id)}
                        disabled={processing === deposit.id}
                      >
                        Release Deposit
                      </Button>
                    </div>
                  )}

                  {deposit.status === 'CAPTURED' && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Deposit captured. Funds will be transferred with your next payout.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">Document Everything</p>
            <p>Take photos before and after each rental. This protects both you and the customer.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Communicate Clearly</p>
            <p>
              Inform customers about deposit holds and release timelines. Most banks release holds within
              5-7 business days.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Be Fair</p>
            <p>
              Only capture deposits for legitimate damages or extra charges. Review your deposit policy
              with customers upfront.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Act Quickly</p>
            <p>
              Authorizations expire after 7 days. Review deposits promptly after rentals end.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
