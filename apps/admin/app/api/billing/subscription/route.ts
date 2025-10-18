import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@valore/database';
import { stripe, createSubscriptionCheckoutSession, STRIPE_CONFIG } from '@/lib/stripe';
import { getOrCreateTenantBilling, switchPlan } from '@/lib/billing-service';
import { BillingPlan } from '@prisma/client';

const TENANT_ID = 'default'; // Replace with multi-tenant logic

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const session = cookieStore.get('admin-session');
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const billing = await getOrCreateTenantBilling(TENANT_ID);

    if (!billing.stripeSubscriptionId) {
      return NextResponse.json({
        hasSubscription: false,
        plan: billing.plan,
      });
    }

    // Fetch subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(billing.stripeSubscriptionId, {
      expand: ['default_payment_method', 'latest_invoice'],
    });

    return NextResponse.json({
      hasSubscription: true,
      plan: billing.plan,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at,
        items: subscription.items.data.map(item => ({
          id: item.id,
          priceId: item.price.id,
          interval: item.price.recurring?.interval,
          amount: item.price.unit_amount,
          currency: item.price.currency,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const session = cookieStore.get('admin-session');
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { action, plan, interval = 'monthly' } = body;

    const billing = await getOrCreateTenantBilling(TENANT_ID);

    if (action === 'create-checkout') {
      // Validate plan
      if (!['STARTER', 'PRO'].includes(plan)) {
        return NextResponse.json(
          { error: 'Invalid plan. Choose STARTER or PRO.' },
          { status: 400 }
        );
      }

      // Get price ID
      const priceKey = `${plan.toLowerCase()}_${interval}` as keyof typeof STRIPE_CONFIG.prices;
      const priceId = STRIPE_CONFIG.prices[priceKey];

      if (!priceId) {
        return NextResponse.json(
          { error: 'Price configuration missing. Contact support.' },
          { status: 500 }
        );
      }

      let customerId = billing.stripeCustomerId;

      // Create customer if doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: 'admin@flyrentals.com',
          name: 'Admin User',
          metadata: {
            tenantId: TENANT_ID,
          },
        });

        customerId = customer.id;

        await prisma.tenantBillingProfile.update({
          where: { tenantId: TENANT_ID },
          data: {
            stripeCustomerId: customerId,
            billingEmail: 'admin@flyrentals.com',
          },
        });
      }

      // Create checkout session
      const checkoutSession = await createSubscriptionCheckoutSession({
        customerId,
        priceId,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/subscriptions?success=true`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/subscriptions?canceled=true`,
        metadata: {
          tenantId: TENANT_ID,
          plan,
        },
      });

      return NextResponse.json({
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id,
      });
    }

    if (action === 'cancel') {
      if (!billing.stripeSubscriptionId) {
        return NextResponse.json(
          { error: 'No active subscription' },
          { status: 400 }
        );
      }

      const immediately = body.immediately === true;

      await stripe.subscriptions.update(billing.stripeSubscriptionId, {
        cancel_at_period_end: !immediately,
      });

      if (immediately) {
        await stripe.subscriptions.cancel(billing.stripeSubscriptionId);
      }

      // Audit log
      await prisma.auditLog.create({
        data: {
          actor: 'admin@flyrentals.com',
          action: 'subscription_canceled',
          entity: 'TenantBillingProfile',
          entityId: TENANT_ID,
          metadata: { immediately },
        },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'update') {
      if (!billing.stripeSubscriptionId) {
        return NextResponse.json(
          { error: 'No active subscription' },
          { status: 400 }
        );
      }

      const subscription = await stripe.subscriptions.retrieve(billing.stripeSubscriptionId);
      const currentItemId = subscription.items.data[0].id;

      const priceKey = `${plan.toLowerCase()}_${interval}` as keyof typeof STRIPE_CONFIG.prices;
      const newPriceId = STRIPE_CONFIG.prices[priceKey];

      if (!newPriceId) {
        return NextResponse.json(
          { error: 'Price configuration missing' },
          { status: 500 }
        );
      }

      await stripe.subscriptions.update(billing.stripeSubscriptionId, {
        items: [
          {
            id: currentItemId,
            price: newPriceId,
          },
        ],
        proration_behavior: 'always_invoice',
      });

      await switchPlan(TENANT_ID, plan as BillingPlan, {
        stripeSubscriptionId: billing.stripeSubscriptionId,
        actor: 'admin@flyrentals.com',
        reason: 'subscription_updated',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error managing subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to manage subscription' },
      { status: 500 }
    );
  }
}
