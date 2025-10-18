'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink, 
  Loader2,
  Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ConnectStatus {
  connected: boolean;
  needsOnboarding?: boolean;
  stripeAccountId?: string;
  payoutsEnabled?: boolean;
  chargesEnabled?: boolean;
  detailsSubmitted?: boolean;
  onboardingStatus?: string;
  requirements?: {
    currentlyDue: string[];
    pastDue: string[];
    eventuallyDue: string[];
  };
}

export default function PayoutsTab() {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchConnectStatus();
  }, []);

  const fetchConnectStatus = async () => {
    try {
      const res = await fetch('/api/billing/connect');
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching Connect status:', error);
      toast.error('Failed to load payout status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPayouts = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/billing/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', country: 'US' }),
      });

      const data = await res.json();

      if (data.url) {
        // Redirect to Stripe Connect onboarding
        window.location.href = data.url;
      } else {
        toast.error('Failed to create onboarding link');
      }
    } catch (error) {
      console.error('Error connecting payouts:', error);
      toast.error('Failed to connect payouts');
    } finally {
      setProcessing(false);
    }
  };

  const handleRefreshLink = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/billing/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh-link' }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to refresh onboarding link');
      }
    } catch (error) {
      console.error('Error refreshing link:', error);
      toast.error('Failed to refresh link');
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenDashboard = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/billing/connect/dashboard', {
        method: 'POST',
      });

      const data = await res.json();

      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        toast.error('Failed to open dashboard');
      }
    } catch (error) {
      console.error('Error opening dashboard:', error);
      toast.error('Failed to open dashboard');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not connected yet
  if (status?.needsOnboarding || !status?.connected) {
    return (
      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <Wallet className="h-12 w-12 text-blue-600 mb-4" />
            <CardTitle className="text-blue-900">Get Paid Automatically</CardTitle>
            <CardDescription className="text-blue-800">
              Connect your payout account to receive payments from your bookings. Stripe handles
              verification & deposits securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-white p-4 space-y-2">
                <h4 className="font-medium">What you'll need:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Business or personal information</li>
                  <li>• Bank account details for payouts</li>
                  <li>• Government-issued ID</li>
                  <li>• 2-3 minutes to complete</li>
                </ul>
              </div>
              <Button 
                onClick={handleConnectPayouts} 
                disabled={processing}
                size="lg"
                className="w-full sm:w-auto"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect Payouts
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Connected
  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payout Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payouts Enabled</span>
              {status.payoutsEnabled ? (
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Yes
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  No
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Charges Enabled</span>
              {status.chargesEnabled ? (
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Yes
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  No
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Details Submitted</span>
              {status.detailsSubmitted ? (
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Complete
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Incomplete
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Stripe Account ID</span>
              <p className="font-mono text-sm mt-1">{status.stripeAccountId}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Status</span>
              <p className="font-medium mt-1">{status.onboardingStatus}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requirements */}
      {status.requirements && (
        <>
          {status.requirements.pastDue.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Action Required:</strong> You have {status.requirements.pastDue.length}{' '}
                past due requirement(s). Complete them to enable payouts.
              </AlertDescription>
            </Alert>
          )}

          {status.requirements.currentlyDue.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Information Needed:</strong> You have {status.requirements.currentlyDue.length}{' '}
                requirement(s) to complete onboarding.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Payouts</CardTitle>
          <CardDescription>
            Access your Stripe Express dashboard to view payouts, update bank details, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button 
            onClick={handleOpenDashboard} 
            disabled={processing}
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            Open Stripe Dashboard
          </Button>
          
          {!status.detailsSubmitted && (
            <Button 
              variant="outline" 
              onClick={handleRefreshLink}
              disabled={processing}
            >
              Complete Onboarding
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={fetchConnectStatus}
            disabled={processing}
          >
            Refresh Status
          </Button>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Payouts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Payout Schedule:</strong> Funds from bookings are typically paid out within 2-7 business
            days to your bank account.
          </p>
          <p>
            <strong>Security:</strong> Your banking information is securely stored by Stripe, never by us.
          </p>
          <p>
            <strong>Fees:</strong> Platform fees are automatically deducted before payout. No additional
            processing fees for you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
