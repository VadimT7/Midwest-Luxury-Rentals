import { stripe } from './stripe';
import { prisma } from '@valore/database';

/**
 * Creates a payment intent for a booking with automatic revenue share
 * This is the simplified version that handles everything automatically
 */
export async function createBookingPayment(params: {
  bookingId: string;
  tenantId: string;
  amountCents: number;
  currency: string;
  customerEmail: string;
  description: string;
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  // Get tenant's Stripe Connect account
  const connectAccount = await prisma.tenantStripeConnect.findUnique({
    where: { tenantId: params.tenantId },
  });

  if (!connectAccount || !connectAccount.stripeAccountId) {
    throw new Error('Merchant must connect their Stripe account first');
  }

  // Get tenant's current fee percentage
  const billing = await prisma.tenantBillingProfile.findUnique({
    where: { tenantId: params.tenantId },
  });

  if (!billing) {
    throw new Error('Billing profile not found');
  }

  // Calculate application fee (platform's share)
  const applicationFeeCents = Math.round(params.amountCents * (Number(billing.feePercentCurrent) / 100));

  // Create payment intent with automatic transfer
  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amountCents,
    currency: params.currency,
    
    // Automatic revenue share configuration
    on_behalf_of: connectAccount.stripeAccountId,
    transfer_data: {
      destination: connectAccount.stripeAccountId,
    },
    application_fee_amount: applicationFeeCents,
    
    // Metadata for tracking
    metadata: {
      bookingId: params.bookingId,
      tenantId: params.tenantId,
      feePercent: String(Number(billing.feePercentCurrent)),
      plan: billing.plan,
    },
    
    // Customer info
    receipt_email: params.customerEmail,
    description: params.description,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amountCents: params.amountCents,
    applicationFeeCents,
    feePercent: Number(billing.feePercentCurrent),
  };
}
