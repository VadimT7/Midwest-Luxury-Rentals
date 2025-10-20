import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@valore/database';
import { refundPayment } from '@/lib/stripe';

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
    const { bookingId, amountCents, reason } = body;

    // Fetch booking and payment
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: {
          where: {
            type: 'RENTAL_FEE',
            status: 'SUCCEEDED',
          },
          take: 1,
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const payment = booking.payments[0];
    if (!payment || !payment.stripePaymentIntentId) {
      return NextResponse.json({ error: 'No payment to refund' }, { status: 400 });
    }

    // Create refund
    const refund = await refundPayment(
      payment.stripePaymentIntentId,
      amountCents,
      reason
    );

    // Update booking status
    const refundedAmount = refund.amount;
    const totalAmount = Math.round(Number(booking.totalAmount) * 100);
    const isFullRefund = refundedAmount >= totalAmount;

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        status: isFullRefund ? 'CANCELLED' : booking.status,
      },
    });

    // Create refund payment record
    await prisma.payment.create({
      data: {
        bookingId,
        stripeRefundId: refund.id,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        amount: refund.amount / 100,
        currency: refund.currency,
        type: 'REFUND',
        method: 'CARD',
        status: 'SUCCEEDED',
        processedAt: new Date(),
        description: reason || 'Refund',
      },
    });

    // Update fee ledger
    const ledger = await prisma.bookingFeeLedger.findFirst({
      where: { bookingId },
    });

    if (ledger) {
      const refundedFeeCents = Math.round(
        refundedAmount * (Number(ledger.feePercentApplied) / 100)
      );
      await prisma.bookingFeeLedger.update({
        where: { id: ledger.id },
        data: {
          refundedCents: {
            increment: refundedFeeCents,
          },
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actor: 'admin@falconflair.com',
        action: 'refund_created',
        entity: 'Booking',
        entityId: bookingId,
        metadata: {
          refundId: refund.id,
          amount: refundedAmount,
          reason,
          isFullRefund,
        },
      },
    });

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
      },
    });
  } catch (error: any) {
    console.error('Error creating refund:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create refund' },
      { status: 500 }
    );
  }
}
