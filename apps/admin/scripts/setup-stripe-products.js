// Script to set up Stripe products and prices for SaaS subscriptions
// Run this script once to create the products in your Stripe account

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  try {
    console.log('🚀 Setting up Stripe products and prices...');

    // Create Starter Product
    const starterProduct = await stripe.products.create({
      name: 'FlyRentals Starter Plan',
      description: 'For growing car rental businesses',
      metadata: {
        plan: 'STARTER',
      },
    });

    console.log('✅ Created Starter product:', starterProduct.id);

    // Create Starter Monthly Price
    const starterMonthlyPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 39900, // $399.00
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

    // Create Starter Annual Price
    const starterAnnualPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 359900, // $3,599.00 (3 months free)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        plan: 'STARTER',
        interval: 'annual',
      },
    });

    console.log('✅ Created Starter annual price:', starterAnnualPrice.id);

    // Create Pro Product
    const proProduct = await stripe.products.create({
      name: 'FlyRentals Pro Plan',
      description: 'For established car rental businesses',
      metadata: {
        plan: 'PRO',
      },
    });

    console.log('✅ Created Pro product:', proProduct.id);

    // Create Pro Monthly Price
    const proMonthlyPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 99900, // $999.00
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

    // Create Pro Annual Price
    const proAnnualPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 799900, // $7,999.00 (4 months free)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        plan: 'PRO',
        interval: 'annual',
      },
    });

    console.log('✅ Created Pro annual price:', proAnnualPrice.id);

    console.log('\n📝 Add these to your .env.local file:');
    console.log('# Stripe Price IDs for SaaS Plans');
    console.log(`STRIPE_PRICE_STARTER_MONTHLY=${starterMonthlyPrice.id}`);
    console.log(`STRIPE_PRICE_STARTER_ANNUAL=${starterAnnualPrice.id}`);
    console.log(`STRIPE_PRICE_PRO_MONTHLY=${proMonthlyPrice.id}`);
    console.log(`STRIPE_PRICE_PRO_ANNUAL=${proAnnualPrice.id}`);

    console.log('\n✅ Stripe products setup complete!');
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
