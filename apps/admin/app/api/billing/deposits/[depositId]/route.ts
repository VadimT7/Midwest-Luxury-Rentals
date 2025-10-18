import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@valore/database';
import { captureDeposit, cancelDeposit } from '@/lib/stripe';

export async function POST(
  req: NextRequest,
  { params }: { params: { depositId: string } }
) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const session = cookieStore.get('admin-session');
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev && (!session || session.value !== 'authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, amountCents } = body;

    const deposit = await prisma.depositAuthorization.findUnique({
      where: { id: params.depositId },
    });

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    if (deposit.status !== 'AUTHORIZED') {
      return NextResponse.json(
        { error: 'Deposit is not in authorized state' },
        { status: 400 }
      );
    }

    if (action === 'capture') {
      const captureAmount = amountCents || deposit.amountCents;

      const paymentIntent = await captureDeposit(
        deposit.stripePaymentIntentId,
        captureAmount
      );

      await prisma.depositAuthorization.update({
        where: { id: params.depositId },
        data: {
          status: 'CAPTURED',
          capturedCents: captureAmount,
          capturedAt: new Date(),
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          actor: 'admin@flyrentals.com',
          action: 'deposit_captured',
          entity: 'DepositAuthorization',
          entityId: deposit.id,
          metadata: {
            bookingId: deposit.bookingId,
            capturedAmount: amountCents || deposit.amountCents,
            paymentIntentId: deposit.stripePaymentIntentId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        capturedAmount: amountCents || deposit.amountCents,
        paymentIntentId: paymentIntent.id,
      });
    }

    if (action === 'release') {
      await cancelDeposit(deposit.stripePaymentIntentId);

      await prisma.depositAuthorization.update({
        where: { id: params.depositId },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          actor: 'admin@flyrentals.com',
          action: 'deposit_released',
          entity: 'DepositAuthorization',
          entityId: deposit.id,
          metadata: {
            bookingId: deposit.bookingId,
            paymentIntentId: deposit.stripePaymentIntentId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        released: true,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error managing deposit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to manage deposit' },
      { status: 500 }
    );
  }
}
