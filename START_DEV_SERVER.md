# Start Dev Server - Falcon Flair Rental

## Quick Start

```powershell
# Navigate to admin app
cd "C:\Users\User\Desktop\Repos\Car Renting Firms Clients\Falcon Flair Rental\apps\admin"

# Start the dev server
pnpm dev
```

## Access the App

- **Admin Dashboard:** http://localhost:3001
- **Login:** Click login (no password needed in dev mode)
- **Billing Page:** http://localhost:3001/billing

## Testing Stripe Connect

1. Go to: http://localhost:3001/billing
2. Click on "Get Paid" tab
3. Click "Connect Stripe Express" button
4. Should redirect to Stripe onboarding ✅

## If You Get Errors

### "Cannot read properties of undefined"
- The Prisma client needs to be regenerated
- Run: `cd packages/database && pnpm prisma generate`

### "Unknown field `connectAccount`"
- Already fixed! Just restart the dev server

### "You can only create new accounts..."
- Restart the dev server (it's using cached code)

## Cleanup Test Accounts

If you created test Connect accounts you want to remove:

```powershell
# Reset database record
cd packages/database
pnpm tsx scripts/reset-stripe-connect.ts

# Then delete from Stripe Dashboard:
# https://dashboard.stripe.com/test/connect/accounts/overview
```

## Files Changed

- ✅ Prisma schema relation names fixed
- ✅ Prisma client regenerated
- ✅ .next cache cleared
- ✅ Database reset script created

**Everything is ready to go!** Just start the dev server and test.


