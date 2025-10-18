'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Check, 
  Loader2,
  Sparkles,
  Zap,
  Rocket,
  TrendingUp,
  Crown,
  ArrowRight,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PlanData {
  currentPlan: 'PERFORMANCE' | 'STARTER' | 'PRO';
  feePercent: number;
  hasSubscription: boolean;
  subscriptionStatus?: string;
  subscriptionInterval?: 'monthly' | 'annual';
  subscriptionExpiry?: string;
}

const MONTHLY_PLANS = [
  {
    id: 'PERFORMANCE',
    name: 'Performance',
    monthlyPrice: 0,
    feePercent: 7,
    description: 'Pay as you go',
    features: [
      { text: '7% per booking fee', included: true, highlight: false },
      { text: 'Basic dashboard access', included: true, highlight: false },
      { text: 'Email support', included: true, highlight: false },
      { text: 'Advanced analytics', included: false, highlight: false },
      { text: 'Priority processing', included: false, highlight: false },
      { text: 'Custom branding', included: true, highlight: false },
    ],
    icon: Zap,
    color: 'slate',
    popular: false,
    badge: null,
  },
  {
    id: 'STARTER',
    name: 'Starter',
    monthlyPrice: 399,
    feePercent: 3,
    description: 'For growing businesses',
    features: [
      { text: 'Only 3% per booking', included: true, highlight: true },
      { text: 'Priority support', included: true, highlight: false },
      { text: 'Advanced analytics', included: true, highlight: false },
      { text: 'Priority processing', included: true, highlight: false },
      { text: 'Custom branding', included: true, highlight: false },
    ],
    icon: Rocket,
    color: 'blue',
    popular: true,
    badge: null,
  },
  {
    id: 'PRO',
    name: 'Professional',
    monthlyPrice: 999,
    feePercent: 1,
    description: 'For scaling operations',
    features: [
      { text: 'Only 1% per booking', included: true, highlight: true },
      { text: 'VIP support 24/7', included: true, highlight: 'vip' },
      { text: 'Enterprise analytics', included: true, highlight: false },
      { text: 'Instant processing', included: true, highlight: false },
      { text: 'Full white-label', included: true, highlight: false },
      { text: 'Dedicated success manager', included: true, highlight: false },
    ],
    icon: Crown,
    color: 'indigo',
    popular: false,
    badge: null,
  },
];

const ANNUAL_PLANS = [
  {
    id: 'PERFORMANCE',
    name: 'Performance',
    annualPrice: 0,
    feePercent: 7,
    description: 'Pay as you go',
    features: [
      { text: '7% per booking fee', included: true, highlight: false },
      { text: 'Basic dashboard access', included: true, highlight: false },
      { text: 'Email support', included: true, highlight: false },
      { text: 'Advanced analytics', included: false, highlight: false },
      { text: 'Priority processing', included: false, highlight: false },
      { text: 'Custom branding', included: false, highlight: false },
    ],
    icon: Zap,
    color: 'slate',
    popular: false,
    badge: null,
    savings: null,
    exclusive: [],
  },
  {
    id: 'STARTER',
    name: 'Starter',
    annualPrice: 3599,
    monthlyEquivalent: 300,
    feePercent: 3,
    description: 'Most popular for growth',
    features: [
      { text: 'Only 3% per booking', included: true, highlight: true },
      { text: 'Priority support', included: true, highlight: false },
      { text: 'Advanced analytics suite', included: true, highlight: false },
      { text: 'Priority processing', included: true, highlight: false },
      { text: 'Custom branding', included: true, highlight: false },
    ],
    icon: Rocket,
    color: 'blue',
    popular: true,
    badge: 'Save $1,188/year',
    savings: '3 months free',
    exclusive: [
      'Advanced analytics suite',
      'Priority processing', 
    ],
  },
  {
    id: 'PRO',
    name: 'Professional',
    annualPrice: 7999,
    monthlyEquivalent: 667,
    feePercent: 1,
    description: 'Maximum value for scale',
    features: [
      { text: 'Only 1% per booking', included: true, highlight: true },
      { text: 'VIP support 24/7', included: true, highlight: 'vip' },
      { text: 'Enterprise analytics', included: true, highlight: false },
      { text: 'Instant processing', included: true, highlight: false },
      { text: 'Full white-label', included: true, highlight: false },
      { text: 'Dedicated success manager', included: true, highlight: false },
    ],
    icon: Crown,
    color: 'indigo',
    popular: false,
    badge: 'Save $3,989/year',
    savings: '4 months free',
    exclusive: [
      'VIP support 24/7',
      'Enterprise analytics',
      'Full white-label',
      'Dedicated success manager'
    ],
  },
];

export default function PlanTab() {
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
  const [monthlyBookings, setMonthlyBookings] = useState(50000);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    fetchPlanData();
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      window.history.replaceState({}, '', window.location.pathname + '?tab=plan');
      toast.success('Subscription activated! Updating your plan...');
      
      fetch('/api/billing/sync-subscription', { method: 'POST' })
        .then(() => fetchPlanData())
        .catch(err => console.error('Manual sync failed:', err));
      
      let pollCount = 0;
      const maxPolls = 10;
      const pollInterval = setInterval(async () => {
        pollCount++;
        await fetchPlanData();
        
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          console.log('Plan update polling completed');
        }
      }, 2000);
      
      return () => clearInterval(pollInterval);
    }
  }, []);

  const fetchPlanData = async () => {
    try {
      const res = await fetch('/api/billing/plan');
      const data = await res.json();
      setPlanData(data);
    } catch (error) {
      console.error('Error fetching plan data:', error);
      toast.error('Failed to load plan information');
    } finally {
      setLoading(false);
    }
  };

  const handleBillingIntervalChange = (newInterval: 'monthly' | 'annual') => {
    if (newInterval === billingInterval) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setBillingInterval(newInterval);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);
  };

  const handleSelectPlan = async (planId: string) => {
    if (planId === planData?.currentPlan) {
      toast('You are already on this plan');
      return;
    }

    setProcessing(planId);
    try {
      const res = await fetch('/api/billing/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: planId,
          interval: billingInterval 
        }),
      });

      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.success) {
        toast.success('Plan updated successfully');
        fetchPlanData();
      } else {
        toast.error(data.error || 'Failed to update plan');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    } finally {
      setProcessing(null);
    }
  };

  const calculateFees = (bookings: number) => {
    const performance = bookings * 0.07;
    const starterMonthly = (bookings * 0.03) + 399;
    const starterAnnual = (bookings * 0.03) + 300;
    const proMonthly = (bookings * 0.01) + 999;
    const proAnnual = (bookings * 0.01) + 667;

    return {
      performance,
      starterMonthly,
      starterAnnual,
      proMonthly,
      proAnnual,
      starterSavings: performance - (billingInterval === 'monthly' ? starterMonthly : starterAnnual),
      proSavings: performance - (billingInterval === 'monthly' ? proMonthly : proAnnual),
    };
  };

  const fees = calculateFees(monthlyBookings);
  const PLANS = billingInterval === 'monthly' ? MONTHLY_PLANS : ANNUAL_PLANS;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Current Plan Status */}
      {planData && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Current Plan</h3>
                  <Badge variant="secondary" className="font-semibold">
                    {PLANS.find(p => p.id === planData.currentPlan)?.name}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{planData.feePercent}% per booking</p>
                {planData.hasSubscription && planData.subscriptionInterval && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {planData.subscriptionInterval === 'annual' ? 'Annual' : 'Monthly'} subscription
                    {planData.subscriptionExpiry && (
                      <span className="ml-1">
                        • Renews {new Date(planData.subscriptionExpiry).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Interval Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-muted p-1 rounded-lg relative">
          <button
            onClick={() => handleBillingIntervalChange('monthly')}
            className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
              billingInterval === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => handleBillingIntervalChange('annual')}
            className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all relative ${
              billingInterval === 'annual'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Annual
            <span className="absolute -top-2 -right-3 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap transform rotate-12">
              FREE MONTHS
            </span>
          </button>
        </div>
      </div>

      {/* Annual Benefits Notice */}
      {billingInterval === 'annual' && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-emerald-100 p-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-900 text-sm">Annual Plan Benefits</h4>
              <p className="text-sm text-emerald-700 mt-0.5">
                Save thousands with annual billing and unlock exclusive features
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className={`grid gap-6 lg:grid-cols-3 transition-opacity duration-200 ${
        isTransitioning ? 'opacity-50' : 'opacity-100'
      }`}>
        {PLANS.map((plan: any) => {
          const Icon = plan.icon;
          const isCurrentPlan = planData?.currentPlan === plan.id;
          
          return (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                isCurrentPlan ? 'ring-2 ring-primary' : ''
              } ${
                plan.popular ? 'border-blue-500 border-2 shadow-md' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                </div>
              )}

              {/* Savings Badge */}
              {plan.badge && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-emerald-500 text-white border-0 font-semibold">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="space-y-4 pb-4 pt-12 text-center">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl w-fit mx-auto ${
                  plan.color === 'slate' ? 'bg-slate-100' :
                  plan.color === 'blue' ? 'bg-blue-100' :
                  'bg-indigo-100'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    plan.color === 'slate' ? 'text-slate-600' :
                    plan.color === 'blue' ? 'text-blue-600' :
                    'text-indigo-600'
                  }`} />
                </div>

                {/* Plan Name */}
                <div>
                  <CardTitle className="text-2xl mb-1">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                </div>

                {/* Pricing */}
                <div className="pt-2">
                  {(plan.monthlyPrice === 0 && plan.annualPrice === 0) ? (
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">FREE</div>
                      <div className="text-sm text-muted-foreground">No subscription</div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">
                        ${billingInterval === 'monthly' ? plan.monthlyPrice?.toLocaleString() : plan.annualPrice?.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {billingInterval === 'monthly' ? 'per month' : 'per year'}
                        {billingInterval === 'annual' && plan.monthlyEquivalent && (
                          <span className="block text-emerald-600 font-medium mt-0.5">
                            ${plan.monthlyEquivalent}/mo equivalent
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fee Badge */}
                <div className="flex justify-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    plan.feePercent <= 3 
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {plan.feePercent}% booking fee
                  </div>
                </div>

                {/* Free Months */}
                {plan.savings && (
                  <div className="flex items-center justify-center gap-2 text-base font-bold text-emerald-600">
                    <Check className="h-5 w-5" />
                    {plan.savings}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Features List */}
                <div className="space-y-3 text-center">
                  {plan.features.map((feature: any, i: number) => {
                    const isHighlight = feature.highlight === true;
                    const isVIP = feature.highlight === 'vip';
                    
                    return (
                      <div key={i} className="flex items-center justify-center gap-3">
                        <div className={`rounded-full w-1.5 h-1.5 flex-shrink-0 ${
                          feature.included 
                            ? isVIP 
                              ? 'bg-amber-500' 
                              : isHighlight 
                              ? 'bg-emerald-500' 
                              : 'bg-muted-foreground'
                            : 'bg-muted-foreground/30'
                        }`} />
                        <span className={`text-sm ${
                          feature.included 
                            ? isVIP 
                              ? 'font-semibold text-foreground' 
                              : isHighlight 
                              ? 'font-semibold text-foreground' 
                              : 'text-foreground'
                            : 'text-muted-foreground/60 line-through'
                        }`}>
                          {isVIP && <Crown className="inline h-3.5 w-3.5 mr-1 text-amber-500" />}
                          {feature.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* CTA Button */}
                <Button 
                  className={`w-full h-11 font-semibold ${
                    plan.popular && !isCurrentPlan
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : ''
                  }`}
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  disabled={isCurrentPlan || processing !== null}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {processing === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      Select {plan.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ROI Calculator */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-xl">Savings Calculator</CardTitle>
          </div>
          <CardDescription>
            See your potential savings based on booking volume
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Monthly booking volume</label>
              <span className="text-lg font-bold">
                ${monthlyBookings.toLocaleString()}
              </span>
            </div>
            <Slider 
              value={[monthlyBookings]} 
              onValueChange={(value) => setMonthlyBookings(value[0])}
              min={10000}
              max={200000}
              step={5000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$10K</span>
              <span>$200K</span>
            </div>
          </div>

          {/* Comparison Grid */}
          <div className="grid gap-3">
            {/* Performance */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Performance (7%)</span>
                <span className="text-xl font-bold">
                  ${Math.round(fees.performance).toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </span>
              </div>
            </div>

            {/* Starter */}
            <div className={`p-4 rounded-lg border ${
              fees.starterSavings > 0 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-muted/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Starter {billingInterval === 'annual' ? 'Annual' : ''}
                </span>
                <div className="text-right">
                  <span className="text-xl font-bold">
                    ${Math.round(billingInterval === 'monthly' ? fees.starterMonthly : fees.starterAnnual).toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </span>
                </div>
              </div>
              {fees.starterSavings > 0 && (
                <div className="text-sm text-emerald-600 font-medium">
                  Save ${Math.round(fees.starterSavings * 12).toLocaleString()}/year
                </div>
              )}
            </div>

            {/* Pro */}
            <div className={`p-4 rounded-lg border ${
              fees.proSavings > 0 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-muted/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Professional {billingInterval === 'annual' ? 'Annual' : ''}
                </span>
                <div className="text-right">
                  <span className="text-xl font-bold text-emerald-600">
                    ${Math.round(billingInterval === 'monthly' ? fees.proMonthly : fees.proAnnual).toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </span>
                </div>
              </div>
              {fees.proSavings > 0 && (
                <div className="text-sm text-emerald-600 font-medium">
                  Save ${Math.round(fees.proSavings * 12).toLocaleString()}/year
                </div>
              )}
            </div>
          </div>

          {/* Recommendation */}
          <div className="pt-4 border-t">
            <div className="flex items-start gap-3 text-sm">
              <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                {monthlyBookings >= 100000 ? (
                  <span className="text-emerald-600 font-medium">
                    At your volume, Professional Annual maximizes savings and value.
                  </span>
                ) : monthlyBookings >= 50000 ? (
                  <span className="text-blue-600 font-medium">
                    Starter Annual offers excellent value at your current volume.
                  </span>
                ) : (
                  'As your business grows, paid plans become increasingly cost-effective.'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
