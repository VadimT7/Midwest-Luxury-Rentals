# Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` file in the `apps/admin` directory:

```env
# ============================================
# ADMIN APPLICATION
# ============================================

# Admin URL (used for Stripe redirects)
# Development: http://localhost:3001
# Production: https://admin.yourdomain.com
ADMIN_URL=http://localhost:3001

# ============================================
# DATABASE
# ============================================

DATABASE_URL="your-database-url"
DIRECT_DATABASE_URL="your-database-url"

# ============================================
# STRIPE CONFIGURATION
# ============================================

# Stripe API Keys (from Stripe Dashboard → API Keys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret (from Stripe Dashboard → Webhooks)
# Development: Use `stripe listen --forward-to localhost:3001/api/billing/webhooks-simple`
# Production: Create webhook in Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe API Version
STRIPE_API_VERSION=2023-10-16

# ============================================
# STRIPE PRICE IDs
# ============================================

# Create these in Stripe Dashboard → Products
# Or run: node scripts/setup-stripe-products.js

# Starter Plan
STRIPE_PRICE_STARTER_MONTHLY=price_...  # $399/mo
STRIPE_PRICE_STARTER_ANNUAL=price_...   # $3,599/year

# Pro Plan
STRIPE_PRICE_PRO_MONTHLY=price_...      # $999/mo
STRIPE_PRICE_PRO_ANNUAL=price_...       # $7,999/year
```

## Why ADMIN_URL is Important

The `ADMIN_URL` variable ensures that after completing:
1. **Stripe Connect Express onboarding** → Returns to admin dashboard
2. **Stripe Checkout (subscriptions)** → Returns to admin dashboard

### Local Development:
```env
ADMIN_URL=http://localhost:3001
```

### Production:
```env
ADMIN_URL=https://admin.flyrentals.com
```

## Creating Stripe Products

Run the setup script to create products and get price IDs:

```bash
cd apps/admin
node scripts/setup-stripe-products.js
```

The script will output the price IDs. Copy them to your `.env.local` file.

## Webhook Setup

### Local Development:
```bash
stripe listen --forward-to localhost:3001/api/billing/webhooks-simple
```

Copy the webhook signing secret (starts with `whsec_`) to `STRIPE_WEBHOOK_SECRET`.

### Production:
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://admin.yourdomain.com/api/billing/webhooks-simple`
3. Select events:
   - `account.updated`
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copy the signing secret to your production `.env`

## Verification

After setting up environment variables, verify everything works:

1. **Start dev server**: `npm run dev`
2. **Visit**: http://localhost:3001/billing
3. **Connect Stripe**: Should redirect back to localhost:3001 after completion
4. **Choose Plan**: Should redirect back to localhost:3001 after checkout

All redirects should stay within the admin dashboard!

