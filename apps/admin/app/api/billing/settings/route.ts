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

    const billing = await prisma.tenantBillingProfile.findUnique({
      where: { tenantId: TENANT_ID },
    });

    if (!billing) {
      return NextResponse.json({
        taxId: '',
        taxIdType: '',
        billingEmail: '',
        statementDescriptor: '',
        supportEmail: '',
        country: 'US',
        currency: 'USD',
        autoTax: false,
        invoicePrefix: 'FLY-',
        invoiceFooter: '',
      });
    }

    return NextResponse.json({
      taxId: billing.taxId || '',
      taxIdType: '',
      billingEmail: billing.billingEmail || '',
      statementDescriptor: '',
      supportEmail: '',
      country: billing.country || 'US',
      currency: billing.currency || 'USD',
      autoTax: false,
      invoicePrefix: 'FLY-',
      invoiceFooter: '',
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const session = cookieStore.get('admin-session');
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      taxId,
      taxIdType,
      billingEmail,
      statementDescriptor,
      supportEmail,
      country,
      currency,
      autoTax,
      invoicePrefix,
      invoiceFooter,
    } = body;

    // Ensure billing profile exists
    let billing = await prisma.tenantBillingProfile.findUnique({
      where: { tenantId: TENANT_ID },
    });

    if (!billing) {
      const performanceEndsAt = new Date();
      performanceEndsAt.setDate(performanceEndsAt.getDate() + 60);

      billing = await prisma.tenantBillingProfile.create({
        data: {
          tenantId: TENANT_ID,
          plan: 'PERFORMANCE',
          planStartedAt: new Date(),
          performanceEndsAt,
          feePercentCurrent: 7.0,
          feePercentAfter: 2.0,
          country: country || 'US',
          currency: currency || 'USD',
        },
      });
    }

    // Update billing profile (only fields that exist in schema)
    const updatedBilling = await prisma.tenantBillingProfile.update({
      where: { tenantId: TENANT_ID },
      data: {
        taxId,
        billingEmail,
        country,
        currency,
      },
    });

    // Update Stripe customer if exists
    if (updatedBilling.stripeCustomerId && stripe) {
      try {
        await stripe.customers.update(updatedBilling.stripeCustomerId, {
          email: billingEmail,
          tax: taxId && taxIdType ? {
            ip_address: null,
            // @ts-ignore - Stripe types might not be up to date
            id_number: taxId,
            type: taxIdType,
          } : undefined,
          metadata: {
            supportEmail,
            country,
            currency,
          },
        });
      } catch (error) {
        console.error('Error updating Stripe customer:', error);
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actor: 'admin@flyrentals.com',
        actorType: 'user',
        action: 'settings_updated',
        entity: 'TenantBillingProfile',
        entityId: TENANT_ID,
        metadata: { updatedFields: Object.keys(body) },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}
