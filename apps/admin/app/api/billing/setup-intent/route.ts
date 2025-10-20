import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@valore/database';
import { stripe, createSetupIntent } from '@/lib/stripe';
import { getOrCreateTenantBilling } from '@/lib/billing-service';

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

    const billing = await getOrCreateTenantBilling(TENANT_ID);

    let customerId = billing.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: 'admin@falconflair.com',
        name: 'Admin User',
        metadata: {
          tenantId: TENANT_ID,
        },
      });

      customerId = customer.id;

      await prisma.tenantBillingProfile.update({
        where: { tenantId: TENANT_ID },
        data: {
          stripeCustomerId: customerId,
          billingEmail: 'admin@falconflair.com',
        },
      });
    }

    // Create Setup Intent for card on file
    const setupIntent = await createSetupIntent(customerId);

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId,
    });
  } catch (error: any) {
    console.error('Error creating setup intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create setup intent' },
      { status: 500 }
    );
  }
}
