# Production Database Setup Guide

## The Issue
Your production database on Vercel doesn't have the tables yet. The local database was set up with `npx prisma db push`, but production needs the same setup.

## Solution Options

### Option 1: Use Prisma Migrate (Recommended)
This creates proper migration files that can be deployed to production.

```bash
# 1. Navigate to database package
cd packages/database

# 2. Create a migration from your current schema
npx prisma migrate dev --name init

# 3. Deploy to production
npx prisma migrate deploy
```

### Option 2: Push Schema to Production
This directly applies the schema without migration files.

```bash
# 1. Navigate to database package
cd packages/database

# 2. Push schema to production database
npx prisma db push --accept-data-loss
```

### Option 3: Use Vercel CLI
If you have Vercel CLI installed:

```bash
# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Link to your project
vercel link

# 3. Run database commands in production environment
vercel env pull .env.production
npx prisma db push --schema=./packages/database/prisma/schema.prisma
```

## After Setting Up Tables

Once the tables are created in production, you can seed the database:

```bash
# Run the seed script in production
NODE_ENV=production npx tsx packages/database/scripts/seed-falcon-flair.ts
```

## Environment Variables Check

Make sure these are set in your Vercel project:
- `DATABASE_URL` - Your Neon production database URL
- `DIRECT_DATABASE_URL` - Same as DATABASE_URL
- `NEXTAUTH_SECRET` - A secure random string

## Verification

After setup, you can verify by:
1. Checking your Vercel admin dashboard
2. Looking at the Neon database dashboard
3. Running a test query

## Troubleshooting

### If you get connection errors:
- Verify your Neon database is active
- Check the DATABASE_URL in Vercel environment variables
- Ensure SSL mode is enabled (`?sslmode=require`)

### If tables still don't exist:
- Try the migration approach instead of db push
- Check if you're connected to the right database
- Verify the schema file is correct
