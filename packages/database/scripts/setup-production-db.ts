import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setting up production database...')
  
  // Check if we're in production
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  
  if (!isProduction) {
    console.log('⚠️  This script is designed for production. Set NODE_ENV=production or VERCEL=1 to run.')
    process.exit(1)
  }

  console.log('✅ Production environment detected')
  console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
  
  // Test database connection
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }

  // Check if tables exist
  try {
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'Car'
    `
    console.log('📋 Car table exists:', result.length > 0)
  } catch (error) {
    console.log('📋 Could not check table existence:', error)
  }

  await prisma.$disconnect()
  console.log('✅ Production database check complete')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
