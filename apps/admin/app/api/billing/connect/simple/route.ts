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
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev && (!session || session.value !== 'authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Connect account exists
    const connectAccount = await prisma.tenantStripeConnect.findUnique({
      where: { tenantId: TENANT_ID },
    });

    if (!connectAccount) {
      return NextResponse.json({ 
        connected: false,
      });
    }

    // Always refresh account status from Stripe to get latest info
    let accountDetails = null;
    if (stripe) {
      try {
        accountDetails = await stripe.accounts.retrieve(connectAccount.stripeAccountId);
        
        // Update database with latest status from Stripe
        await prisma.tenantStripeConnect.update({
          where: { tenantId: TENANT_ID },
          data: {
            detailsSubmitted: accountDetails.details_submitted || false,
            payoutsEnabled: accountDetails.payouts_enabled || false,
            chargesEnabled: accountDetails.charges_enabled || false,
            onboardingStatus: accountDetails.details_submitted ? 'COMPLETE' : 'PENDING',
            lastCheckedAt: new Date(),
          },
        });

        console.log('✅ Updated Connect account status:', {
          detailsSubmitted: accountDetails.details_submitted,
          payoutsEnabled: accountDetails.payouts_enabled,
          chargesEnabled: accountDetails.charges_enabled,
        });
      } catch (error) {
        console.error('Error fetching Stripe account:', error);
      }
    }

    return NextResponse.json({
      connected: true,
      stripeAccountId: connectAccount.stripeAccountId,
      detailsSubmitted: accountDetails?.details_submitted || connectAccount.detailsSubmitted,
      payoutsEnabled: accountDetails?.payouts_enabled || connectAccount.payoutsEnabled,
      chargesEnabled: accountDetails?.charges_enabled || connectAccount.chargesEnabled,
    });
  } catch (error: any) {
    console.error('Error fetching Connect status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch status' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const session = cookieStore.get('admin-session');
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev && (!session || session.value !== 'authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 [Connect API] POST request received');
    console.log('🔍 [Connect API] Stripe initialized:', !!stripe);
    console.log('🔍 [Connect API] Stripe secret key exists:', !!process.env.STRIPE_SECRET_KEY);

    if (!stripe) {
      console.error('❌ [Connect API] Stripe is not configured');
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { action } = body;

    console.log('🔍 [Connect API] Action:', action);

    if (action === 'connect' || action === 'refresh') {
      // Check if already exists
      const existing = await prisma.tenantStripeConnect.findUnique({
        where: { tenantId: TENANT_ID },
      });

      console.log('🔍 [Connect API] Existing account:', existing ? existing.stripeAccountId : 'none');

      let accountId = existing?.stripeAccountId;

      if (!accountId) {
        // Ensure a billing profile exists to satisfy FK constraint
        await getOrCreateTenantBilling(TENANT_ID);

        console.log('🔍 [Connect API] Creating new Connect account...');
        
        // Create new Connect Express account
        const account = await createConnectAccount({
          email: 'admin@falconflair.com', // Use actual tenant email
          country: 'US',
          businessType: 'individual',
        });

        console.log('✅ [Connect API] Created account:', account.id);
        accountId = account.id;

        // Save to database
        await prisma.tenantStripeConnect.create({
          data: {
            tenantId: TENANT_ID,
            stripeAccountId: accountId,
            onboardingStatus: 'PENDING',
            payoutsEnabled: false,
            chargesEnabled: false,
            detailsSubmitted: false,
          },
        });
      }

      // Generate account link for onboarding
      const accountLink = await createAccountLink(accountId);

      return NextResponse.json({
        url: accountLink.url,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error managing Connect:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect Stripe' },
      { status: 500 }
    );
  }
}
