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

  // Check if event already processed (idempotency)
  const existingLog = await prisma.webhookEventLog.findUnique({
    where: { eventId: event.id },
  });

  if (existingLog?.processed) {
    console.log('Event already processed:', event.id);
    return NextResponse.json({ received: true, cached: true });
  }

  // Log the event
  await prisma.webhookEventLog.upsert({
    where: { eventId: event.id },
    create: {
      eventId: event.id,
      eventType: event.type,
      payload: event as any,
      processed: false,
      attemptCount: 1,
    },
    update: {
      attemptCount: {
        increment: 1,
      },
    },
  });

  try {
    // Process the event
    await processWebhookEvent(event);

    // Mark as processed
    await prisma.webhookEventLog.update({
      where: { eventId: event.id },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);

    // Log the error
    await prisma.webhookEventLog.update({
      where: { eventId: event.id },
      data: {
        processingError: error.message,
      },
    });

    // Return 500 so Stripe retries
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}

async function processWebhookEvent(event: Stripe.Event) {
  console.log('Processing webhook event:', event.type);

  switch (event.type) {
    // Connect Account Events
    case 'account.updated': {
      const account = event.data.object as Stripe.Account;
      await handleAccountUpdated(account);
      break;
    }

    case 'capability.updated': {
      const capability = event.data.object as Stripe.Capability;
      await handleCapabilityUpdated(capability);
      break;
    }

    // Payment Events (Marketplace)
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentSucceeded(paymentIntent);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentFailed(paymentIntent);
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      await handleChargeRefunded(charge);
      break;
    }

    case 'charge.dispute.created': {
      const dispute = event.data.object as Stripe.Dispute;
      await handleDisputeCreated(dispute);
      break;
    }

    case 'charge.dispute.closed': {
      const dispute = event.data.object as Stripe.Dispute;
      await handleDisputeClosed(dispute);
      break;
    }

    // Subscription Events (SaaS)
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription') {
        await handleCheckoutSessionCompleted(session);
      } else if (session.mode === 'setup') {
        await handleSetupCompleted(session);
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentSucceeded(invoice);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentFailed(invoice);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }

    // Setup Intent (Card on File)
    case 'setup_intent.succeeded': {
      const setupIntent = event.data.object as Stripe.SetupIntent;
      await handleSetupIntentSucceeded(setupIntent);
      break;
    }

    default:
      console.log('Unhandled event type:', event.type);
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
        requirements: account.requirements as any,
        lastCheckedAt: new Date(),
        onboardingStatus: account.details_submitted 
          ? 'COMPLETE' 
          : account.requirements?.currently_due?.length 
          ? 'INCOMPLETE' 
          : 'PENDING',
      },
    });
  }
}

async function handleCapabilityUpdated(capability: Stripe.Capability) {
  const connectAccount = await prisma.tenantStripeConnect.findUnique({
    where: { stripeAccountId: capability.account as string },
  });

  if (connectAccount && stripe) {
    // Refresh full account status
    const account = await stripe.accounts.retrieve(capability.account as string);
    await handleAccountUpdated(account);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId;
  const isDeposit = paymentIntent.metadata.type === 'deposit';

  if (!bookingId) {
    console.warn('Payment intent without bookingId:', paymentIntent.id);
    return;
  }

  if (isDeposit) {
    // Update deposit authorization
    await prisma.depositAuthorization.upsert({
      where: { bookingId },
      create: {
        bookingId,
        stripePaymentIntentId: paymentIntent.id,
        amountCents: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.capture_method === 'manual' ? 'AUTHORIZED' : 'CAPTURED',
        capturedCents: paymentIntent.capture_method === 'manual' ? 0 : paymentIntent.amount,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        metadata: paymentIntent.metadata as any,
      },
      update: {
        status: paymentIntent.capture_method === 'manual' ? 'AUTHORIZED' : 'CAPTURED',
        capturedCents: paymentIntent.capture_method === 'manual' ? 0 : paymentIntent.amount,
      },
    });
  } else {
    // Update booking payment
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
      },
    });

    // Record payment
    await prisma.payment.upsert({
      where: { stripePaymentIntentId: paymentIntent.id },
      create: {
        bookingId,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        type: 'RENTAL_FEE',
        method: 'CARD',
        status: 'SUCCEEDED',
        processedAt: new Date(),
      },
      update: {
        status: 'SUCCEEDED',
        processedAt: new Date(),
      },
    });
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId;

  if (bookingId) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'FAILED',
      },
    });

    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'FAILED',
        failureReason: paymentIntent.last_payment_error?.message,
      },
    });
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;

  if (paymentIntentId) {
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: { booking: true },
    });

    if (payment) {
      const refundedAmount = charge.amount_refunded;
      const totalAmount = charge.amount;

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: refundedAmount === totalAmount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        },
      });

      // Update fee ledger
      const ledger = await prisma.bookingFeeLedger.findFirst({
        where: { bookingId: payment.bookingId },
      });

      if (ledger) {
        const refundedFeeCents = Math.round(refundedAmount * (Number(ledger.feePercentApplied) / 100));
        await prisma.bookingFeeLedger.update({
          where: { id: ledger.id },
          data: {
            refundedCents: refundedFeeCents,
          },
        });
      }
    }
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  if (!stripe) return;
  const charge = await stripe.charges.retrieve(dispute.charge as string);
  const paymentIntentId = charge.payment_intent as string;

  if (paymentIntentId) {
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (payment) {
      await prisma.dispute.create({
        data: {
          bookingId: payment.bookingId,
          stripeDisputeId: dispute.id,
          amount: dispute.amount,
          currency: dispute.currency,
          reason: dispute.reason,
          status: dispute.status === 'warning_needs_response' ? 'WARNING_NEEDS_RESPONSE' : 'NEEDS_RESPONSE',
          evidenceDueBy: dispute.evidence_details?.due_by 
            ? new Date(dispute.evidence_details.due_by * 1000)
            : null,
          evidenceDetails: dispute.evidence_details as any,
          isChargeRefundable: dispute.is_charge_refundable,
          metadata: dispute.metadata as any,
        },
      });

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CANCELLED' },
      });
    }
  }
}

async function handleDisputeClosed(dispute: Stripe.Dispute) {
  await prisma.dispute.update({
    where: { stripeDisputeId: dispute.id },
    data: {
      status: dispute.status === 'won' ? 'WON' : dispute.status === 'lost' ? 'LOST' : 'WARNING_CLOSED',
    },
  });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (!stripe) return;
  const tenantId = session.metadata?.tenantId;
  const plan = session.metadata?.plan;

  if (!tenantId || !plan) {
    console.warn('Checkout session without tenantId or plan:', session.id);
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  await switchPlan(tenantId, plan as any, {
    stripeSubscriptionId: subscription.id,
    actor: 'stripe_webhook',
    reason: 'checkout_completed',
  });

  await prisma.auditLog.create({
    data: {
      actor: 'stripe',
      actorType: 'system',
      action: 'subscription_created',
      entity: 'TenantBillingProfile',
      entityId: tenantId,
      metadata: {
        subscriptionId: subscription.id,
        plan,
      },
    },
  });
}

async function handleSetupCompleted(session: Stripe.Checkout.Session) {
  // Handle setup mode completion if needed
  console.log('Setup session completed:', session.id);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    console.log('Invoice paid for subscription:', invoice.subscription);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!stripe || !invoice.subscription) return;
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const customerId = subscription.customer as string;

  const billing = await prisma.tenantBillingProfile.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (billing) {
    // TODO: Send notification to tenant about failed payment
    console.error('Payment failed for tenant:', billing.tenantId);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const billing = await prisma.tenantBillingProfile.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (billing) {
    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      // Downgrade to Performance plan
      await switchPlan(billing.tenantId, 'PERFORMANCE', {
        actor: 'stripe_webhook',
        reason: 'subscription_canceled',
      });
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const billing = await prisma.tenantBillingProfile.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (billing) {
    await switchPlan(billing.tenantId, 'PERFORMANCE', {
      actor: 'stripe_webhook',
      reason: 'subscription_deleted',
    });

    await prisma.tenantBillingProfile.update({
      where: { tenantId: billing.tenantId },
      data: {
        stripeSubscriptionId: null,
      },
    });
  }
}

async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  const customerId = setupIntent.customer as string;
  const paymentMethodId = setupIntent.payment_method as string;

  const billing = await prisma.tenantBillingProfile.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (billing) {
    await prisma.tenantBillingProfile.update({
      where: { tenantId: billing.tenantId },
      data: {
        stripePaymentMethodId: paymentMethodId,
        cardOnFile: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actor: 'stripe',
        actorType: 'system',
        action: 'card_on_file_added',
        entity: 'TenantBillingProfile',
        entityId: billing.tenantId,
      },
    });
  }
}
