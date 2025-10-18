import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@valore/database';
import { stripe } from '@/lib/stripe';

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

    const billing = await prisma.tenantBillingProfile.findUnique({
      where: { tenantId: TENANT_ID },
    });

    const invoices = [];

    // Fetch SaaS subscription invoices if customer exists
    if (billing?.stripeCustomerId) {
      try {
        const stripeInvoices = await stripe.invoices.list({
          customer: billing.stripeCustomerId,
          limit: 10,
        });

        for (const invoice of stripeInvoices.data) {
          invoices.push({
            id: invoice.id,
            number: invoice.number || invoice.id,
            amount: invoice.amount_paid || invoice.total,
            currency: invoice.currency,
            status: invoice.status || 'draft',
            createdAt: new Date(invoice.created * 1000).toISOString(),
            paidAt: invoice.status_transitions?.paid_at 
              ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
              : undefined,
            pdfUrl: invoice.invoice_pdf,
            type: 'subscription',
          });
        }
      } catch (error) {
        console.error('Error fetching Stripe invoices:', error);
      }
    }

    // Fetch recent booking receipts
    const bookingPayments = await prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            bookingNumber: true,
          },
        },
      },
    });

    for (const payment of bookingPayments) {
      invoices.push({
        id: payment.id,
        number: `BOOK-${payment.booking.bookingNumber}`,
        amount: Number(payment.amount) * 100, // Convert to cents
        currency: payment.currency || 'USD',
        status: 'paid',
        createdAt: payment.createdAt.toISOString(),
        paidAt: payment.processedAt?.toISOString(),
        type: 'booking',
      });
    }

    // Sort by date
    invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
