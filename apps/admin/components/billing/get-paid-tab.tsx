'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ExternalLink, 
  Loader2,
  Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ConnectStatus {
  connected: boolean;
  stripeAccountId?: string;
  detailsSubmitted?: boolean;
  payoutsEnabled?: boolean;
  chargesEnabled?: boolean;
}

export default function GetPaidTab() {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchConnectStatus();
    
    // If returning from onboarding, refresh status after a short delay
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('onboarding') === 'complete') {
      // Remove the query param from URL
      window.history.replaceState({}, '', window.location.pathname + '?tab=get-paid');
      
      // Refresh status after a short delay to allow Stripe to update
      setTimeout(() => {
        console.log('Refreshing Connect status after onboarding...');
        fetchConnectStatus();
      }, 2000);
    }
  }, []);

  const fetchConnectStatus = async () => {
    try {
      const res = await fetch('/api/billing/connect/simple');
      const data = await res.json();
      console.log('Connect status received:', data);
      setStatus({
        connected: data.connected || false,
        stripeAccountId: data.stripeAccountId,
        detailsSubmitted: data.detailsSubmitted,
        payoutsEnabled: data.payoutsEnabled,
        chargesEnabled: data.chargesEnabled,
      });
    } catch (error) {
      console.error('Error fetching Connect status:', error);
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/billing/connect/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' }),
      });

      const data = await res.json();

      if (data.url) {
        // Redirect to Stripe Connect onboarding
        window.location.href = data.url;
      } else {
        toast.error('Failed to create onboarding link');
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast.error('Failed to connect Stripe');
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

  const handleRefreshLink = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/billing/connect/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to generate onboarding link');
      }
    } catch (error) {
      console.error('Error refreshing link:', error);
      toast.error('Failed to refresh onboarding link');
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

  if (status?.connected) {
    // Check if onboarding is complete
    const onboardingComplete = status.detailsSubmitted;

    return (
      <div className="max-w-5xl mx-auto">
        <Card className={`${onboardingComplete 
          ? "border-green-200 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50" 
          : "border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
        } shadow-lg`}>
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`rounded-2xl p-4 ${onboardingComplete ? 'bg-green-100 shadow-md' : 'bg-amber-100'}`}>
                  {onboardingComplete ? (
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  ) : (
                    <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
                  )}
                </div>
                <div>
                  <CardTitle className={`text-3xl font-bold ${onboardingComplete ? 'text-green-900' : 'text-amber-900'}`}>
                    {onboardingComplete ? 'Connected to Stripe' : 'Onboarding in Progress'}
                  </CardTitle>
                  <CardDescription className={`text-lg mt-2 ${onboardingComplete ? 'text-green-700' : 'text-amber-700'}`}>
                    {onboardingComplete 
                      ? "You're all set to receive payments from bookings"
                      : "Complete your onboarding to start receiving payments"
                    }
                  </CardDescription>
                </div>
              </div>
              {onboardingComplete && (
                <Button 
                  variant="outline"
                  onClick={handleOpenDashboard} 
                  disabled={processing}
                  size="lg"
                  className="bg-white hover:bg-gray-50"
                >
                  {processing ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-5 w-5" />
                  )}
                  Open Stripe Dashboard
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Account ID Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Stripe Account ID</p>
                  <p className="font-mono text-lg font-semibold">{status.stripeAccountId}</p>
                </div>
                {status.payoutsEnabled && (
                  <Badge className="bg-green-100 text-green-800 px-3 py-1">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Payouts Enabled
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Required */}
            {!onboardingComplete && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-l-4 border-amber-500 shadow-sm">
                <h4 className="font-semibold text-amber-900 text-lg mb-2 flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Action Required
                </h4>
                <p className="text-muted-foreground mb-4">
                  You need to complete your Stripe onboarding to start receiving payments. 
                  This includes verifying your identity and bank account details.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleRefreshLink} 
                    disabled={processing}
                    size="lg"
                    className="flex-1"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Complete Onboarding
                        <ExternalLink className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setLoading(true);
                      fetchConnectStatus();
                    }} 
                    disabled={processing}
                  >
                    Refresh Status
                  </Button>
                </div>
              </div>
            )}

            {/* How It Works */}
            {onboardingComplete && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  How it works
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 mt-0.5">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Customer Payments</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Customers pay for bookings through our secure platform
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-purple-100 p-2 mt-0.5">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Automatic Transfer</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your share is automatically transferred to your Stripe account
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-green-100 p-2 mt-0.5">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Bank Payouts</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Stripe handles payouts to your bank (usually 2-7 business days)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-orange-100 p-2 mt-0.5">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Automatic Fees</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Platform fee is deducted automatically based on your plan
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto rounded-full bg-blue-100 p-4 w-fit mb-4">
            <Wallet className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Start Receiving Payments</CardTitle>
          <CardDescription className="text-base mt-2">
            Connect your Stripe account to receive automatic payouts from bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium">What you'll need:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Business or personal bank account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Government-issued ID for verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>2-3 minutes to complete setup</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">How it works:</h4>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>Click the button below to connect your Stripe account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Complete the quick verification process with Stripe</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Start receiving automatic payouts from bookings</span>
              </li>
            </ol>
          </div>

          <Button 
            onClick={handleConnectStripe} 
            disabled={processing}
            size="lg"
            className="w-full"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Connect Stripe (2 min)
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure connection powered by Stripe. We never have access to your banking details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


