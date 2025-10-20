import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@valore/database';
import { createDestinationCharge, createDepositAuthorization } from '@/lib/stripe';
import { calculateBookingFee, recordBookingFee } from '@/lib/billing-service';

const TENANT_ID = 'default'; // Replace with multi-tenant logic

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const session = cookieStore.get('admin-session');
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev && (!session || session.value !== 'authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, createDeposit = false } = body;

    // Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        car: {
          include: {
            priceRules: {
              where: { isActive: true },
              take: 1,
            },
          },
        },
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if Connect account exists and is ready
    const connectAccount = await prisma.tenantStripeConnect.findUnique({
      where: { tenantId: TENANT_ID },
    });

    if (!connectAccount || !connectAccount.chargesEnabled) {
      return NextResponse.json(
        { error: 'Merchant payouts not configured. Complete onboarding first.' },
        { status: 400 }
      );
    }

    // Calculate fees
    const totalAmountCents = Math.round(Number(booking.totalAmount) * 100);
    const { applicationFeeCents, feePercent, plan } = await calculateBookingFee(
      TENANT_ID,
      totalAmountCents
    );

    // Create main payment intent
    const paymentIntent = await createDestinationCharge({
      amountCents: totalAmountCents,
      currency: booking.currency.toLowerCase(),
      connectedAccountId: connectAccount.stripeAccountId,
      applicationFeeCents,
      customerEmail: booking.user.email,
      description: `Booking #${booking.bookingNumber} - ${booking.car.displayName}`,
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        tenantId: TENANT_ID,
        type: 'rental',
      },
      idempotencyKey: `booking:${booking.id}:payment`,
    });

    // Record fee ledger
    await recordBookingFee({
      bookingId: booking.id,
      tenantId: TENANT_ID,
      applicationFeeCents,
      feePercent,
      plan,
      bookingAmountCents: totalAmountCents,
      currency: booking.currency,
    });

    let depositPaymentIntent;

    // Create deposit authorization if requested
    if (createDeposit && booking.car.priceRules[0]) {
      const depositAmountCents = Math.round(
        Number(booking.car.priceRules[0].depositAmount) * 100
      );
      const depositFeeCents = Math.round(depositAmountCents * (feePercent / 100));

      depositPaymentIntent = await createDepositAuthorization({
        amountCents: depositAmountCents,
        currency: booking.currency.toLowerCase(),
        connectedAccountId: connectAccount.stripeAccountId,
        applicationFeeCents: depositFeeCents,
        customerEmail: booking.user.email,
        description: `Security Deposit - Booking #${booking.bookingNumber}`,
        metadata: {
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
          tenantId: TENANT_ID,
          type: 'deposit',
        },
        idempotencyKey: `booking:${booking.id}:deposit`,
      });

      // Record deposit authorization
      await prisma.depositAuthorization.create({
        data: {
          bookingId: booking.id,
          stripePaymentIntentId: depositPaymentIntent.id,
          amountCents: depositAmountCents,
          currency: booking.currency,
          status: 'AUTHORIZED',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          metadata: {
            feePercent,
            applicationFeeCents: depositFeeCents,
          },
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actor: 'admin@falconflair.com',
        action: 'booking_payment_created',
        entity: 'Booking',
        entityId: booking.id,
        metadata: {
          paymentIntentId: paymentIntent.id,
          amount: totalAmountCents,
          applicationFee: applicationFeeCents,
          depositIntentId: depositPaymentIntent?.id,
        },
      },
    });

    return NextResponse.json({
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        applicationFee: applicationFeeCents,
      },
      depositIntent: depositPaymentIntent
        ? {
            id: depositPaymentIntent.id,
            clientSecret: depositPaymentIntent.client_secret,
            amount: depositPaymentIntent.amount,
            currency: depositPaymentIntent.currency,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error creating booking payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}
