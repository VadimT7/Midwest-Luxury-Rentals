import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetStripeConnect() {
  const tenantId = 'default'; // Change if using different tenant ID
  
  try {
    console.log('🔄 Resetting Stripe Connect for tenant:', tenantId);
    
    // Check if Connect account exists
    const existing = await prisma.tenantStripeConnect.findUnique({
      where: { tenantId },
    });
    
    if (existing) {
      console.log('📋 Found existing Connect account:');
      console.log('   Stripe Account ID:', existing.stripeAccountId);
      console.log('   Status:', existing.onboardingStatus);
      console.log('   Payouts Enabled:', existing.payoutsEnabled);
      
      // Delete it
      await prisma.tenantStripeConnect.delete({
        where: { tenantId },
      });
      
      console.log('✅ Deleted stale Connect account record');
    } else {
      console.log('ℹ️  No Connect account found in database');
    }
    
    console.log('\n✅ Reset complete! You can now start the onboarding process fresh.');
    console.log('   Go to: http://localhost:3001/billing → Get Paid tab → Connect Stripe');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetStripeConnect()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

