import Stripe from 'stripe';

// Initialize Stripe with error handling
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('⚠️  STRIPE_SECRET_KEY is not defined. Stripe functionality will be limited.');
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      // Prefer env-configured version; fall back to a stable public version
      apiVersion: (process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion | undefined) || '2023-10-16',
      typescript: true,
    })
  : null;

// Stripe product and price IDs from environment
export const STRIPE_CONFIG = {
  prices: {
    starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
    starter_annual: process.env.STRIPE_PRICE_STARTER_ANNUAL || '',
    pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL || '',
  },
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  platformCurrency: 'USD',
  // Use ADMIN_URL for all redirects (defaults to localhost:3001)
  connectRefreshUrl: (process.env.ADMIN_URL || 'http://localhost:3001') + '/billing?tab=get-paid',
  connectReturnUrl: (process.env.ADMIN_URL || 'http://localhost:3001') + '/billing?tab=get-paid&onboarding=complete',
};

export type BillingPlan = 'PERFORMANCE' | 'STARTER' | 'PRO' | 'DIY';

export const PLAN_FEE_CONFIG: Record<BillingPlan, { percent: number; description: string }> = {
  PERFORMANCE: { percent: 7.0, description: '7% per booking for first 60 days' },
  STARTER: { percent: 3.0, description: '3% per booking + SaaS subscription' },
  PRO: { percent: 1.0, description: '1% per booking + SaaS subscription' },
  DIY: { percent: 0, description: 'No marketplace fees' },
};

export function calculateApplicationFee(
  amountCents: number,
  feePercent: number,
  minimumCents?: number
): number {
  const calculatedFee = Math.round(amountCents * (feePercent / 100));
  return minimumCents ? Math.max(calculatedFee, minimumCents) : calculatedFee;
}

export function getActiveFeePercent(
  plan: BillingPlan,
  planStartedAt: Date,
  performanceEndsAt: Date | null
): number {
  const now = new Date();
  
  if (plan === 'PERFORMANCE' && performanceEndsAt && now <= performanceEndsAt) {
    return PLAN_FEE_CONFIG.PERFORMANCE.percent;
  }
  
  return PLAN_FEE_CONFIG[plan].percent;
}

export async function createConnectAccount(params: {
  email: string;
  country: string;
  businessType?: 'individual' | 'company';
}) {
  if (!stripe) throw new Error('Stripe is not initialized');
  
  const account = await stripe.accounts.create({
    type: 'express',
    country: params.country,
    email: params.email,
    business_type: params.businessType || 'individual',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  return account;
}

export async function createAccountLink(accountId: string) {
  if (!stripe) throw new Error('Stripe is not initialized');
  
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: STRIPE_CONFIG.connectRefreshUrl,
    return_url: STRIPE_CONFIG.connectReturnUrl,
    type: 'account_onboarding',
  });

  return accountLink;
}

export async function getConnectAccountStatus(accountId: string) {
  if (!stripe) throw new Error('Stripe is not initialized');
  
  const account = await stripe.accounts.retrieve(accountId);
  
  return {
    id: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requirements: {
      currentlyDue: account.requirements?.currently_due || [],
      eventuallyDue: account.requirements?.eventually_due || [],
      pastDue: account.requirements?.past_due || [],
      errors: account.requirements?.errors || [],
    },
  };
}

export async function createExpressDashboardLink(accountId: string) {
  if (!stripe) throw new Error('Stripe is not initialized');
  
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  return loginLink.url;
}

export async function createSetupIntent(customerId: string) {
  if (!stripe) throw new Error('Stripe is not initialized');
  
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
    usage: 'off_session',
  });

  return setupIntent;
}

export async function createSubscriptionCheckoutSession(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  if (!stripe) throw new Error('Stripe is not initialized');
  
  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    customer_update: {
      name: 'auto',
      address: 'auto',
    },
    tax_id_collection: {
      enabled: true,
    },
  });

  return session;
}

export async function createDestinationCharge(params: {
  amountCents: number;
  currency: string;
  connectedAccountId: string;
  applicationFeeCents: number;
  customerEmail: string;
  description: string;
  metadata: Record<string, string>;
  idempotencyKey: string;
}) {
  if (!stripe) throw new Error('Stripe is not initialized');
  
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: params.amountCents,
      currency: params.currency,
      application_fee_amount: params.applicationFeeCents,
      transfer_data: {
        destination: params.connectedAccountId,
      },
      on_behalf_of: params.connectedAccountId,
      receipt_email: params.customerEmail,
      description: params.description,
      metadata: params.metadata,
    },
    {
      idempotencyKey: params.idempotencyKey,
    }
  );

  return paymentIntent;
}

export async function createDepositAuthorization(params: {
  amountCents: number;
  currency: string;
  connectedAccountId: string;
  applicationFeeCents: number;
  customerEmail: string;
  description: string;
  metadata: Record<string, string>;
  idempotencyKey: string;
}) {
  if (!stripe) throw new Error('Stripe is not initialized');
  
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: params.amountCents,
      currency: params.currency,
      application_fee_amount: params.applicationFeeCents,
      transfer_data: {
        destination: params.connectedAccountId,
      },
      on_behalf_of: params.connectedAccountId,
      receipt_email: params.customerEmail,
      description: params.description,
      metadata: params.metadata,
      capture_method: 'manual',
    },
    {
      idempotencyKey: params.idempotencyKey,
    }
  );

  return paymentIntent;
}

export async function captureDeposit(paymentIntentId: string, amountToCapture?: number) {
  if (!stripe) throw new Error('Stripe is not initialized');
  
  const paymentIntent = await stripe.paymentIntents.capture(
    paymentIntentId,
    amountToCapture ? { amount_to_capture: amountToCapture } : undefined
  );

  return paymentIntent;
}

export async function cancelDeposit(paymentIntentId: string) {
  if (!stripe) throw new Error('Stripe is not initialized');
  
  const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
  return paymentIntent;
}

export async function refundPayment(paymentIntentId: string, amountCents?: number, reason?: string) {
  if (!stripe) throw new Error('Stripe is not initialized');
  
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amountCents,
    reason: reason as Stripe.RefundCreateParams.Reason,
  });

  return refund;
}

export async function getUpcomingInvoice(subscriptionId: string) {
  if (!stripe) throw new Error('Stripe is not initialized');
  
  const invoice = await stripe.invoices.retrieveUpcoming({
    subscription: subscriptionId,
  });

  return invoice;
}

export async function cancelSubscription(subscriptionId: string, immediately = false) {
  if (!stripe) throw new Error('Stripe is not initialized');
  
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

export async function updateSubscription(subscriptionId: string, newPriceId: string) {
  if (!stripe) throw new Error('Stripe is not initialized');
  
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'always_invoice',
  });
}
