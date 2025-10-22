// Script to set up Stripe products and prices for Simplified Billing
// Run this script once to create the products in your Stripe account

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  try {
    console.log('🚀 Setting up Stripe products for Simplified Billing...');

    // Create Starter Product
    const starterProduct = await stripe.products.create({
      name: 'Midwest Luxury Starter Plan',
      description: '2% per booking + $99/month',
      metadata: {
        plan: 'STARTER',
      },
    });

    console.log('✅ Created Starter product:', starterProduct.id);

    // Create Starter Monthly Price
    const starterMonthlyPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 9900, // $99.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'STARTER',
        interval: 'monthly',
      },
    });

    console.log('✅ Created Starter monthly price:', starterMonthlyPrice.id);

    // Create Pro Product
    const proProduct = await stripe.products.create({
      name: 'Midwest Luxury Pro Plan',
      description: '1% per booking + $199/month',
      metadata: {
        plan: 'PRO',
      },
    });

    console.log('✅ Created Pro product:', proProduct.id);

    // Create Pro Monthly Price
    const proMonthlyPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 19900, // $199.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'PRO',
        interval: 'monthly',
      },
    });

    console.log('✅ Created Pro monthly price:', proMonthlyPrice.id);

    console.log('\n📝 Add these to your .env.local file:');
    console.log('# Stripe Price IDs for Simplified Billing Plans');
    console.log(`STRIPE_PRICE_STARTER_MONTHLY=${starterMonthlyPrice.id}`);
    console.log(`STRIPE_PRICE_PRO_MONTHLY=${proMonthlyPrice.id}`);

    console.log('\n✅ Stripe products setup complete!');
    console.log('\n📊 Pricing Summary:');
    console.log('• Performance: 7% per booking (no subscription)');
    console.log('• Starter: 2% per booking + $99/month');
    console.log('• Pro: 1% per booking + $199/month');
  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error.message);
    process.exit(1);
  }
}

// Check if we have the required environment variable
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY environment variable is not set');
  console.log('Please set it in your environment or .env.local file');
  process.exit(1);
}

setupStripeProducts();

