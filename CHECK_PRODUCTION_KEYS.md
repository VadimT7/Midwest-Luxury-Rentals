# Check Production Stripe Keys

## Vercel Environment Variables

Go to your Vercel project settings:
1. https://vercel.com/dashboard → Select your project
2. Go to **Settings** → **Environment Variables**
3. Find these variables:

### Required Stripe Variables:
```
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_API_VERSION
```

### Check the Keys:

**Test Mode Keys (for staging/dev):**
- `pk_test_...` (publishable)
- `sk_test_...` (secret)

**Live Mode Keys (for production):**
- `pk_live_...` (publishable)
- `sk_live_...` (secret)

## What to Do:

### If Using LIVE Keys in Production:
You MUST enable Stripe Connect for Live Mode:
1. Go to: https://dashboard.stripe.com/ (make sure "Live" mode is selected)
2. Navigate to: Connect → Get Started
3. Enable Connect Express
4. Accept terms and complete setup

### If Using TEST Keys in Production (Not Recommended):
You can keep using test mode, but this means:
- ⚠️ No real payments will be processed
- ⚠️ Only test card numbers will work
- ⚠️ Not suitable for production use

## After Enabling Connect in Live Mode:

1. **Redeploy your app** on Vercel (may not be necessary, but recommended)
2. **Test the Connect flow** in production:
   - Go to your production URL/billing
   - Click "Get Paid" tab
   - Click "Connect Stripe Express"
   - Should now redirect to Stripe onboarding ✅

## Common Issues:

### "Account restricted"
Your Stripe account may need additional verification before Connect is available in Live mode. Check Stripe Dashboard for any notices.

### "Platform not found"
Make sure you completed the full Connect activation process in Live mode, not just Test mode.

### Still showing the error
Double-check you're actually using Live keys in production by looking at the Vercel environment variables.


