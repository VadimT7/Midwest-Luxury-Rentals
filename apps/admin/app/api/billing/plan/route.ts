import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@valore/database';
import { stripe, createSubscriptionCheckoutSession, STRIPE_CONFIG } from '@/lib/stripe';
import { getOrCreateTenantBilling, switchPlan } from '@/lib/billing-service';

const TENANT_ID = 'default'; // Replace with multi-tenant logic

export async function GET(req: NextRequest) {
  try {
    // Check authentication (allow unauthenticated in dev for easier testing)
    const cookieStore = cookies();
    const session = cookieStore.get('admin-session');
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev && (!session || session.value !== 'authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure billing profile exists
    const billing = await getOrCreateTenantBilling(TENANT_ID);

    // Get subscription details if exists
    let subscriptionInterval: 'monthly' | 'annual' | undefined;
    let subscriptionExpiry: string | undefined;

    if (billing.stripeSubscriptionId && stripe) {
      try {
        const subscription = await stripe.subscriptions.retrieve(billing.stripeSubscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        
        // Determine interval from price ID
        const starterMonthly = process.env.STRIPE_PRICE_STARTER_MONTHLY;
        const starterAnnual = process.env.STRIPE_PRICE_STARTER_ANNUAL;
        const proMonthly = process.env.STRIPE_PRICE_PRO_MONTHLY;
        const proAnnual = process.env.STRIPE_PRICE_PRO_ANNUAL;

        if (priceId === starterMonthly || priceId === proMonthly) {
          subscriptionInterval = 'monthly';
        } else if (priceId === starterAnnual || priceId === proAnnual) {
          subscriptionInterval = 'annual';
        }

        // Get expiry date (current period end)
        subscriptionExpiry = new Date(subscription.current_period_end * 1000).toISOString();
      } catch (error) {
        console.error('Error fetching subscription details:', error);
      }
    }

    return NextResponse.json({
      currentPlan: billing.plan,
      feePercent: Number(billing.feePercentCurrent),
      hasSubscription: !!billing.stripeSubscriptionId,
      subscriptionStatus: billing.stripeSubscriptionId ? 'active' : null,
      subscriptionInterval,
      subscriptionExpiry,
    });
  } catch (error: any) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication (allow unauthenticated in dev for easier testing)
    const cookieStore = cookies();
    const session = cookieStore.get('admin-session');
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev && (!session || session.value !== 'authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan, interval = 'monthly' } = body;

    if (!['PERFORMANCE', 'STARTER', 'PRO'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    if (!['monthly', 'annual'].includes(interval)) {
      return NextResponse.json(
        { error: 'Invalid interval' },
        { status: 400 }
      );
    }

    // Ensure billing profile exists
    let billing = await getOrCreateTenantBilling(TENANT_ID);

    // If selecting Performance plan (no subscription needed)
    if (plan === 'PERFORMANCE') {
      await switchPlan(TENANT_ID, 'PERFORMANCE', { actor: 'system', reason: 'manual_selection' });
      await prisma.tenantBillingProfile.update({
        where: { tenantId: TENANT_ID },
        data: { stripeSubscriptionId: null },
      });

      return NextResponse.json({ success: true });
    }

    // For Starter and Pro plans, create Stripe Checkout session
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    // Determine fee percentage based on plan
    const feePercent = plan === 'STARTER' ? 3.0 : 1.0;

    // Get or create Stripe customer
    let customerId = billing.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: 'admin@flyrentals.com', // Use actual tenant email
        metadata: {
          tenantId: TENANT_ID,
        },
      });
      customerId = customer.id;

      await prisma.tenantBillingProfile.update({
        where: { tenantId: TENANT_ID },
        data: {
          stripeCustomerId: customerId,
        },
      });
    }

    // Get price ID (support both price_ and prod_ values in env)
    const priceKey = `${plan.toLowerCase()}_${interval}` as keyof typeof STRIPE_CONFIG.prices;
    let envValue = STRIPE_CONFIG.prices[priceKey];

    if (!envValue) {
      return NextResponse.json(
        { error: 'Price configuration missing. Please set up Stripe products first.' },
        { status: 500 }
      );
    }

    let priceId = envValue;

    // If a product ID (prod_...) was provided, resolve its default price
    if (envValue.startsWith('prod_')) {
      try {
        const product = await stripe.products.retrieve(envValue);
        const defaultPrice = product.default_price;
        if (typeof defaultPrice === 'string' && defaultPrice.startsWith('price_')) {
          priceId = defaultPrice;
        } else {
          // Fallback: list prices for the product (monthly recurring preferred)
          const prices = await stripe.prices.list({ product: envValue, active: true, limit: 10 });
          const monthly = prices.data.find(p => p.recurring?.interval === 'month');
          if (monthly) {
            priceId = monthly.id;
          } else if (prices.data[0]) {
            priceId = prices.data[0].id;
          } else {
            return NextResponse.json(
              { error: 'No prices found for the configured product. Please add a recurring price in Stripe.' },
              { status: 500 }
            );
          }
        }
      } catch (e: any) {
        console.error('Failed to resolve product to price:', e?.message || e);
        return NextResponse.json(
          { error: 'Failed to resolve Stripe product to a price. Check your env values.' },
          { status: 500 }
        );
      }
    }

    // Create checkout session - Always redirect to admin dashboard
    const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';
    const checkoutSession = await createSubscriptionCheckoutSession({
      customerId,
      priceId,
      successUrl: `${adminUrl}/billing?tab=plan&success=true`,
      cancelUrl: `${adminUrl}/billing?tab=plan&canceled=true`,
      metadata: {
        tenantId: TENANT_ID,
        plan,
        feePercent: String(feePercent),
      },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
    });
  } catch (error: any) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update plan' },
      { status: 500 }
    );
  }
}
