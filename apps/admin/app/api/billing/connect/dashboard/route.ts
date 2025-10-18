import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@valore/database';
import { createExpressDashboardLink, stripe } from '@/lib/stripe';

const TENANT_ID = 'default'; // Replace with multi-tenant logic

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

    const connectAccount = await prisma.tenantStripeConnect.findUnique({
      where: { tenantId: TENANT_ID },
    });

    if (!connectAccount) {
      return NextResponse.json(
        { error: 'No Connect account found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    const dashboardUrl = await createExpressDashboardLink(connectAccount.stripeAccountId);

    return NextResponse.json({ url: dashboardUrl });
  } catch (error: any) {
    console.error('Error creating dashboard link:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create dashboard link' },
      { status: 500 }
    );
  }
}
