# Falcon Flair Database Setup Instructions

## Step 1: Ensure Environment Variables are Set

Make sure your `.env` or `.env.local` file has the correct Neon database connection strings:

```env
DATABASE_URL="your-neon-connection-string"
DIRECT_DATABASE_URL="your-neon-connection-string"
```

## Step 2: Install Dependencies

Run these commands from the project root:

```bash
# Install all dependencies
pnpm install
```

## Step 3: Set Up Database Schema

Navigate to the database package and run migrations:

```bash
# Navigate to database package
cd packages/database

# Generate Prisma Client
npx prisma generate

# Push the schema to create tables
npx prisma db push

# If you need to apply migrations instead:
# npx prisma migrate deploy
```

## Step 4: Seed Falcon Flair Data

Run the custom seed script for Falcon Flair vehicles:

```bash
# Still in packages/database directory
npx tsx scripts/seed-falcon-flair.ts

# Or if tsx is not available:
npx ts-node scripts/seed-falcon-flair.ts
```

## What Gets Created

The seed script will create:

### 6 Premium Vehicles:
1. **2025 BMW M440 Coupé** - 699 AED/day
   - 374 HP, 0-100 km/h in 4.5s
   
2. **Mercedes-Benz CLE 53 AMG** - 699 AED/day
   - 443 HP, 0-100 km/h in 4.0s
   
3. **Mercedes-Benz C43 AMG** - 499 AED/day
   - 408 HP, 0-100 km/h in 4.6s
   
4. **2025 ROX 01 VIP** - 699 AED/day
   - Plug-in Hybrid, 1300 km range
   
5. **Audi RS3 Hatchback - Daytona Grey** - 699 AED/day
   - 400 HP, 0-100 km/h in 3.8s
   
6. **Audi RS3 Hatchback - Mythos Black** - 699 AED/day
   - 400 HP, 0-100 km/h in 3.8s

### Additional Data:
- Admin user: admin@falconflair.ae
- Test customer: customer@example.com
- 90 days of availability for each vehicle
- 5 add-ons (insurance, GPS, etc.)
- 3 pricing rules (weekend special, early bird, long-term)

## Verify Setup

1. Check your Neon dashboard - you should see the tables populated
2. Run the admin dashboard:
   ```bash
   pnpm dev
   ```
3. Login to admin at http://localhost:3001 with admin@falconflair.ae
4. Visit the website at http://localhost:3000 to see the vehicles

## Troubleshooting

### If you get connection errors:
- Verify your Neon database is active (it may pause after inactivity)
- Check the connection string in your .env file
- Ensure SSL mode is set: `?sslmode=require`

### To reset and start fresh:
```bash
cd packages/database
npx prisma db push --force-reset
npx tsx scripts/seed-falcon-flair.ts
```

### For Production (Vercel):
Add these environment variables to your Vercel project:
- DATABASE_URL
- DIRECT_DATABASE_URL
- NEXTAUTH_SECRET (generate with: openssl rand -base64 32)

