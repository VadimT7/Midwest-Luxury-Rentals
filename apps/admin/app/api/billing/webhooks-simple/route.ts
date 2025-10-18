import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@valore/database';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';
import { switchPlan } from '@/lib/billing-service';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Processing webhook event:', event.type);

  try {
    switch (event.type) {
      // Connect Account - Update status
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      }

      // Subscription created - Update plan
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription') {
          await handleCheckoutCompleted(session);
        }
        break;
      }

      // Payment succeeded - Mark booking as paid
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  const connectAccount = await prisma.tenantStripeConnect.findUnique({
    where: { stripeAccountId: account.id },
  });

  if (connectAccount) {
    await prisma.tenantStripeConnect.update({
      where: { stripeAccountId: account.id },
      data: {
        payoutsEnabled: account.payouts_enabled || false,
        chargesEnabled: account.charges_enabled || false,
        detailsSubmitted: account.details_submitted || false,
        onboardingStatus: account.details_submitted ? 'COMPLETE' : 'PENDING',
        lastCheckedAt: new Date(),
      },
    });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenantId;
  const plan = session.metadata?.plan;
  const feePercent = parseFloat(session.metadata?.feePercent || '0');

  if (!tenantId || !plan) {
    console.warn('Checkout session missing metadata:', session.id);
    return;
  }

  // Update billing profile with new plan via service (audit + consistency)
  await switchPlan(tenantId, plan as any, {
    actor: 'stripe_webhook',
    reason: 'checkout_completed',
    stripeSubscriptionId: session.subscription as string,
  });

  console.log(`Updated tenant ${tenantId} to plan ${plan} with ${feePercent}% fee`);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata?.bookingId;

  if (!bookingId) {
    // Not a booking payment, ignore
    return;
  }

  // Update booking as paid
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
    },
  });

  // Record payment
  await prisma.payment.create({
    data: {
      bookingId,
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      type: 'RENTAL_FEE',
      method: 'CARD',
      status: 'SUCCEEDED',
      processedAt: new Date(),
    },
  });

  // Record fee in ledger if application fee exists
  if (paymentIntent.application_fee_amount) {
    const tenantBilling = await prisma.tenantBillingProfile.findFirst({
      where: {
        connectAccount: {
          stripeAccountId: paymentIntent.on_behalf_of as string,
        },
      },
    });

    if (tenantBilling) {
      await prisma.bookingFeeLedger.create({
        data: {
          bookingId,
          tenantId: tenantBilling.tenantId,
          applicationFeeCents: paymentIntent.application_fee_amount,
          feePercentApplied: tenantBilling.feePercentCurrent,
          planSnapshot: tenantBilling.plan,
          bookingAmountCents: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      });
    }
  }

  console.log(`Booking ${bookingId} marked as paid`);
}
