import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@valore/database';
import { stripe } from '@/lib/stripe';
import { switchPlan } from '@/lib/billing-service';

const TENANT_ID = 'default'; // Replace with multi-tenant logic

/**
 * Manual sync endpoint to update subscription status from Stripe
 * This is a fallback in case webhooks aren't working
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication (allow unauthenticated in dev for easier testing)
    const cookieStore = cookies();
    const session = cookieStore.get('admin-session');
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev && (!session || session.value !== 'authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Get current billing profile
    const billing = await prisma.tenantBillingProfile.findUnique({
      where: { tenantId: TENANT_ID },
    });

    if (!billing || !billing.stripeCustomerId) {
      return NextResponse.json({ error: 'No customer found' }, { status: 404 });
    }

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: billing.stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ 
        message: 'No active subscriptions found',
        currentPlan: billing.plan 
      });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price.id;

    // Determine plan from price ID
    let plan: 'STARTER' | 'PRO' | null = null;
    const starterMonthly = process.env.STRIPE_PRICE_STARTER_MONTHLY;
    const starterAnnual = process.env.STRIPE_PRICE_STARTER_ANNUAL;
    const proMonthly = process.env.STRIPE_PRICE_PRO_MONTHLY;
    const proAnnual = process.env.STRIPE_PRICE_PRO_ANNUAL;

    if (priceId === starterMonthly || priceId === starterAnnual) {
      plan = 'STARTER';
    } else if (priceId === proMonthly || priceId === proAnnual) {
      plan = 'PRO';
    }

    if (!plan) {
      return NextResponse.json({ 
        error: 'Could not determine plan from subscription',
        priceId 
      }, { status: 400 });
    }

    // Update plan if different
    if (billing.plan !== plan || billing.stripeSubscriptionId !== subscription.id) {
      await switchPlan(TENANT_ID, plan, {
        actor: 'manual_sync',
        reason: 'subscription_sync',
        stripeSubscriptionId: subscription.id,
      });

      return NextResponse.json({
        success: true,
        message: 'Plan updated successfully',
        oldPlan: billing.plan,
        newPlan: plan,
        subscriptionId: subscription.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Plan already up to date',
      currentPlan: plan,
      subscriptionId: subscription.id,
    });
  } catch (error: any) {
    console.error('Error syncing subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}

