import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@valore/database';
import { stripe, createConnectAccount, createAccountLink } from '@/lib/stripe';
import { getOrCreateTenantBilling } from '@/lib/billing-service';

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
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    const billing = await getOrCreateTenantBilling(TENANT_ID);
    const connectAccount = await prisma.tenantStripeConnect.findUnique({
      where: { tenantId: TENANT_ID },
    });

    if (!connectAccount) {
      return NextResponse.json({ 
        connected: false,
        needsOnboarding: true,
      });
    }

    // Refresh account status
    const account = await stripe.accounts.retrieve(connectAccount.stripeAccountId);
    
    await prisma.tenantStripeConnect.update({
      where: { tenantId: TENANT_ID },
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

    return NextResponse.json({
      connected: true,
      stripeAccountId: connectAccount.stripeAccountId,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
      onboardingStatus: connectAccount.onboardingStatus,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        pastDue: account.requirements?.past_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching Connect account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Connect account' },
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

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { action, country = 'US', businessType = 'individual' } = body;

    if (action === 'create') {
      // Check if already exists
      const existing = await prisma.tenantStripeConnect.findUnique({
        where: { tenantId: TENANT_ID },
      });

      if (existing) {
        // Generate new account link
        const accountLink = await createAccountLink(existing.stripeAccountId);
        return NextResponse.json({ url: accountLink.url });
      }

      // Create new Connect account
      const account = await createConnectAccount({
        email: 'admin@flyrentals.com', // Default email
        country,
        businessType,
      });

      // Save to database
      await prisma.tenantStripeConnect.create({
        data: {
          tenantId: TENANT_ID,
          stripeAccountId: account.id,
          onboardingStatus: 'PENDING',
          payoutsEnabled: false,
          chargesEnabled: false,
          detailsSubmitted: false,
        },
      });

      // Update billing profile with country
      await prisma.tenantBillingProfile.update({
        where: { tenantId: TENANT_ID },
        data: { country },
      });

      // Generate account link for onboarding
      const accountLink = await createAccountLink(account.id);

      // Audit log
      await prisma.auditLog.create({
        data: {
          actor: 'admin@flyrentals.com',
          action: 'connect_account_created',
          entity: 'TenantStripeConnect',
          entityId: TENANT_ID,
          metadata: { stripeAccountId: account.id },
        },
      });

      return NextResponse.json({
        accountId: account.id,
        url: accountLink.url,
      });
    }

    if (action === 'refresh-link') {
      const connectAccount = await prisma.tenantStripeConnect.findUnique({
        where: { tenantId: TENANT_ID },
      });

      if (!connectAccount) {
        return NextResponse.json({ error: 'No Connect account found' }, { status: 404 });
      }

      const accountLink = await createAccountLink(connectAccount.stripeAccountId);
      return NextResponse.json({ url: accountLink.url });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error managing Connect account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to manage Connect account' },
      { status: 500 }
    );
  }
}
