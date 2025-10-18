# Simplified Billing & Payouts Implementation

## Overview
A streamlined revenue share system with just two tabs: **Get Paid** and **Plan**.

## 🎯 Key Features

### Tab A: Get Paid
- **Single Action**: Connect Stripe (2 min)
- **Automatic Payouts**: Stripe handles everything
- **No Manual Management**: No payout settings or schedules

### Tab B: Plan  
- **3 Simple Options**:
  - **Performance**: 7% per booking (no subscription)
  - **Starter**: 2% per booking + $99/month
  - **Pro**: 1% per booking + $199/month

## 💳 How It Works

### 1. Connect Stripe (Get Paid Tab)
```
1. Click "Connect Stripe (2 min)"
2. Complete quick verification with Stripe
3. Done! You're ready to receive payments
```

### 2. Choose Plan (Plan Tab)
```
Performance → No subscription, just 7% per booking
Starter/Pro → Stripe Checkout for subscription + lower fees
```

### 3. Automatic Revenue Share
Every booking automatically:
- Customer pays full amount
- Your share goes to your Stripe account
- Platform fee is deducted automatically
- No manual intervention needed

## 🔧 Technical Implementation

### Data Model (Minimal)
```typescript
// Stripe Connection
TenantStripeConnect {
  tenantId: string
  stripeAccountId: string
  status: string
}

// Plan Selection
TenantBillingProfile {
  tenantId: string
  plan: 'PERFORMANCE' | 'STARTER' | 'PRO'
  feePercentCurrent: number
  stripeSubscriptionId?: string
}

// Bookings
Booking {
  id: string
  tenantId: string
  amountCents: number
  stripePaymentIntentId: string
  status: string
}
```

### Payment Flow
```javascript
// Every booking creates a PaymentIntent with:
{
  amount: totalAmount,
  on_behalf_of: tenant.stripeAccountId,
  transfer_data: {
    destination: tenant.stripeAccountId
  },
  application_fee_amount: totalAmount * feePercent / 100
}
```

### Essential Webhooks (Only 3)
1. `account.updated` → Update Connect status
2. `checkout.session.completed` → Update plan
3. `payment_intent.succeeded` → Mark booking paid

## 📋 Quick Setup

### 1. Environment Variables
```env
# In apps/admin/.env.local
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create with setup script)
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
```

### 2. Create Stripe Products
```bash
cd apps/admin
node scripts/setup-stripe-products.js
```

### 3. Setup Webhook
```bash
# For local testing
stripe listen --forward-to localhost:3001/api/billing/webhooks-simple

# In production, add webhook endpoint in Stripe Dashboard:
https://yourdomain.com/api/billing/webhooks-simple
```

## ✅ Acceptance Criteria

1. ✅ **Get Paid Tab**
   - Single "Connect Stripe" button
   - Shows "Connected ✅" when complete
   - Optional dashboard link

2. ✅ **Plan Tab**
   - 3 clear plan options
   - Simple selection process
   - Automatic fee updates

3. ✅ **Booking Payments**
   - Automatic routing to merchant
   - Platform fee deduction
   - No manual processing

4. ✅ **Clean UI**
   - Only 2 tabs visible
   - No complex settings
   - No payout management

## 🚫 Hidden Features (Kept for Later)
All these features are coded but hidden from UI:
- Overview dashboard
- Detailed payout management
- Deposits & refunds
- Fee schedules
- Invoices & receipts
- Tax configuration
- Dispute handling

To re-enable any feature later, simply update the billing page to show the hidden tabs.

## 📊 Fee Examples

On $10,000 monthly bookings:
- **Performance**: $700 in fees (7%)
- **Starter**: $299 total ($200 fees + $99 subscription)
- **Pro**: $299 total ($100 fees + $199 subscription)

Break-even point for Pro plan: $10,000/month in bookings

## 🎉 Summary

The simplified system provides:
- **2-minute setup** via Stripe Connect
- **3 clear pricing plans**
- **Zero manual payment handling**
- **Automatic revenue sharing**
- **Clean, simple UI**

Everything else is automated by Stripe. Merchants connect once, choose a plan, and payments flow automatically.


