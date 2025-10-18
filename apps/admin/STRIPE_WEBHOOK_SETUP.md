# Stripe Webhook Setup for Local Testing

## Prerequisites
- Stripe CLI installed
- Stripe account with test mode enabled

## Step 1: Install Stripe CLI (if not already installed)

### Windows (PowerShell):
```powershell
# Download and install from https://github.com/stripe/stripe-cli/releases/latest
# Or use Scoop:
scoop install stripe
```

### macOS:
```bash
brew install stripe/stripe-cli/stripe
```

### Linux:
```bash
# Download from https://github.com/stripe/stripe-cli/releases/latest
```

## Step 2: Login to Stripe CLI
```bash
stripe login
```
This will open your browser to authenticate with Stripe.

## Step 3: Forward Webhooks to Local Server

Run this command in a separate terminal window (keep it running):

```bash
stripe listen --forward-to localhost:3001/api/billing/webhooks-simple
```

**Important:** This command will output a webhook signing secret that looks like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

## Step 4: Update Your .env.local

Copy the webhook signing secret and add it to your `apps/admin/.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

## Step 5: Restart Your Dev Server

After updating the `.env.local`, restart your Next.js dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm dev
```

## Step 6: Test the Webhook

Now when you:
1. Complete a Stripe Checkout session
2. Update a Connect account
3. Process a payment

The Stripe CLI will forward the webhook events to your local server, and you'll see logs in both:
- The Stripe CLI terminal (showing forwarded events)
- Your Next.js dev server terminal (showing processed events)

## Monitoring Webhooks

In the Stripe CLI terminal, you'll see output like:
```
2024-01-15 10:30:45   --> checkout.session.completed [evt_xxxxx]
2024-01-15 10:30:45   <-- [200] POST http://localhost:3001/api/billing/webhooks-simple [evt_xxxxx]
```

## Troubleshooting

### Webhook Secret Not Working
- Make sure you copied the FULL secret including `whsec_`
- Restart your dev server after updating `.env.local`
- Check that the secret is in the correct `.env.local` file (apps/admin/.env.local)

### Events Not Being Received
- Ensure the Stripe CLI is running (`stripe listen...`)
- Check that your dev server is running on port 3001
- Verify the webhook endpoint URL is correct

### Testing Specific Events

You can trigger test events manually:
```bash
# Test a checkout session completed event
stripe trigger checkout.session.completed

# Test an account updated event
stripe trigger account.updated

# Test a payment intent succeeded event
stripe trigger payment_intent.succeeded
```

## Production Webhook Setup

For production, you'll need to:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/billing/webhooks-simple`
3. Select events to listen to:
   - `checkout.session.completed`
   - `account.updated`
   - `payment_intent.succeeded`
4. Copy the signing secret and add it to your production environment variables

## Quick Reference Commands

```bash
# Start webhook forwarding
stripe listen --forward-to localhost:3001/api/billing/webhooks-simple

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger account.updated
stripe trigger payment_intent.succeeded

# View recent events
stripe events list

# View specific event details
stripe events retrieve evt_xxxxxxxxxxxxx
```

