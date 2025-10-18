/**
 * Script to set up currency settings in the database
 * Run this after running prisma generate and migrate
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function setupCurrencySettings() {
  try {
    console.log('🔧 Setting up currency settings...')

    // Check if settings table exists
    const settings = [
      {
        key: 'payment_currency',
        value: 'CAD',
        description: 'Default currency for payments (CAD or USD)',
        category: 'payment'
      },
      {
        key: 'stripe_enabled',
        value: 'true',
        description: 'Enable Stripe payment processing',
        category: 'payment'
      },
      {
        key: 'company_name',
        value: 'FlyRentals',
        description: 'Company name',
        category: 'general'
      },
      {
        key: 'company_email',
        value: 'info@flyrentals.ca',
        description: 'Company email',
        category: 'general'
      }
    ]

    for (const setting of settings) {
      try {
        await prisma.systemSettings.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: setting
        })
        console.log(`✅ Setting '${setting.key}' configured: ${setting.value}`)
      } catch (error) {
        console.log(`⚠️ Could not create setting '${setting.key}':`, error.message)
      }
    }

    console.log('✨ Currency settings setup complete!')
  } catch (error) {
    console.error('❌ Error setting up currency settings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupCurrencySettings()
