'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Check, 
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface SubscriptionData {
  hasSubscription: boolean;
  plan: string;
  subscription?: {
    id: string;
    status: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
    items: Array<{
      priceId: string;
      interval: string;
      amount: number;
      currency: string;
    }>;
  };
}

const PLAN_FEATURES = {
  PERFORMANCE: {
    name: 'Performance',
    price: '$0/mo',
    description: 'Get started with 60 days free',
    features: [
      '7% per booking for first 60 days',
      'Then 2% per booking',
      'All core features',
      'Basic support',
    ],
    color: 'purple',
  },
  STARTER: {
    name: 'Starter',
    price: '$99/mo',
    description: 'For growing businesses',
    features: [
      'Only 3% per booking',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
    ],
    color: 'blue',
  },
  PRO: {
    name: 'Pro',
    price: '$199/mo',
    description: 'For established businesses',
    features: [
      'Only 1% per booking',
      '👑 VIP support 24/7',
      'White-label solution',
      'Dedicated account manager',
      'Custom integrations',
      '99.9% uptime SLA',
      'Advanced reporting',
    ],
    color: 'green',
  },
};

export default function SubscriptionsTab() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/billing/subscription');
      const data = await res.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string, interval: 'monthly' | 'annual' = 'monthly') => {
    setProcessing(true);
    try {
      const res = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-checkout', plan, interval }),
      });

      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error(data.error || 'Failed to create checkout');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to upgrade plan');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async (immediately = false) => {
    if (!confirm(immediately 
      ? 'Are you sure you want to cancel immediately? You will lose access right away.' 
      : 'Cancel at end of period? You can use your subscription until then.'
    )) {
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', immediately }),
      });

      if (res.ok) {
        toast.success('Subscription canceled');
        fetchSubscription();
      } else {
        toast.error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
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

  const currentPlan = subscription?.plan || 'PERFORMANCE';

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {subscription?.hasSubscription && subscription.subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>
              Your {PLAN_FEATURES[currentPlan as keyof typeof PLAN_FEATURES]?.name} plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Status</p>
                <Badge className="mt-1">
                  {subscription.subscription.status}
                </Badge>
              </div>
              <div className="text-right">
                <p className="font-medium">Billing Cycle</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {subscription.subscription.items[0]?.interval || 'monthly'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">Next Payment</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(subscription.subscription.currentPeriodEnd * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>

            {subscription.subscription.cancelAtPeriodEnd && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your subscription will be canceled at the end of the current billing period.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleCancelSubscription(false)}
                disabled={processing || subscription.subscription.cancelAtPeriodEnd}
              >
                Cancel at Period End
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleCancelSubscription(true)}
                disabled={processing}
              >
                Cancel Immediately
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Selection */}
      <div>
        <h3 className="text-xl font-bold mb-4">Choose Your Plan</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Performance Plan */}
          <Card className={currentPlan === 'PERFORMANCE' ? 'border-purple-500 border-2' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-100 text-purple-800">
                  {PLAN_FEATURES.PERFORMANCE.name}
                </Badge>
                {currentPlan === 'PERFORMANCE' && (
                  <Badge className="bg-green-100 text-green-800">
                    Current
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-4">{PLAN_FEATURES.PERFORMANCE.price}</CardTitle>
              <CardDescription>{PLAN_FEATURES.PERFORMANCE.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {PLAN_FEATURES.PERFORMANCE.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {currentPlan !== 'PERFORMANCE' && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  disabled
                >
                  Downgrade Not Available
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Starter Plan */}
          <Card className={currentPlan === 'STARTER' ? 'border-blue-500 border-2' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-800">
                  {PLAN_FEATURES.STARTER.name}
                </Badge>
                {currentPlan === 'STARTER' && (
                  <Badge className="bg-green-100 text-green-800">
                    Current
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-4">{PLAN_FEATURES.STARTER.price}</CardTitle>
              <CardDescription>{PLAN_FEATURES.STARTER.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {PLAN_FEATURES.STARTER.features.map((feature, i) => {
                  const isKeyPercentage = feature.includes('Only 3% per booking');
                  
                  return (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        isKeyPercentage ? 'text-orange-600' : 'text-green-600'
                      }`} />
                      <span className={
                        isKeyPercentage 
                          ? 'font-bold text-base bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent animate-pulse' 
                          : ''
                      }>
                        {feature}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {currentPlan !== 'STARTER' && (
                <Button 
                  className="w-full mt-4"
                  onClick={() => handleUpgrade('STARTER')}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Upgrade to Starter'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={currentPlan === 'PRO' ? 'border-green-500 border-2' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {PLAN_FEATURES.PRO.name}
                </Badge>
                {currentPlan === 'PRO' && (
                  <Badge className="bg-green-100 text-green-800">
                    Current
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-4">{PLAN_FEATURES.PRO.price}</CardTitle>
              <CardDescription>{PLAN_FEATURES.PRO.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {PLAN_FEATURES.PRO.features.map((feature, i) => {
                  const isKeyPercentage = feature.includes('Only 1% per booking');
                  const isVIPSupport = feature.includes('👑 VIP support 24/7');
                  
                  return (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        isKeyPercentage ? 'text-orange-600' : isVIPSupport ? 'text-yellow-500' : 'text-green-600'
                      }`} />
                      <span className={`${
                        isKeyPercentage 
                          ? 'font-bold text-base bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent animate-pulse' 
                          : isVIPSupport
                          ? 'font-bold text-base bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent relative'
                          : ''
                      } ${isVIPSupport ? 'relative' : ''}`}>
                        {isVIPSupport && (
                          <span className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 opacity-30 blur-sm rounded-lg animate-pulse" />
                        )}
                        <span className={isVIPSupport ? 'relative z-10' : ''}>
                          {feature}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              {currentPlan !== 'PRO' && (
                <Button 
                  className="w-full mt-4"
                  onClick={() => handleUpgrade('PRO')}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Upgrade to Pro'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Can I change plans anytime?</p>
            <p className="text-muted-foreground mt-1">
              Yes, you can upgrade at any time. Downgrades take effect at the end of your current billing period.
            </p>
          </div>
          <div>
            <p className="font-medium">How do marketplace fees work?</p>
            <p className="text-muted-foreground mt-1">
              Marketplace fees are automatically deducted from each booking. Lower plans have higher per-booking fees.
            </p>
          </div>
          <div>
            <p className="font-medium">What happens after the Performance period?</p>
            <p className="text-muted-foreground mt-1">
              After 60 days, your marketplace fee drops to 2% (Starter plan rate). You can upgrade to Pro for 1% fees anytime.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
