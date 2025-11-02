#!/usr/bin/env tsx

/**
 * Script to delete all customers and reset all revenue to 0
 * This will remove:
 * - All users with role CUSTOMER
 * - All bookings from those customers
 * - ALL payment records (complete revenue reset)
 * - ALL booking fee ledger entries (revenue tracking reset)
 * - All related data (contracts, damage reports, notifications, etc.)
 * 
 * This does NOT delete:
 * - Cars/vehicles
 * - Admin/staff users
 * - System configuration
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteCustomers() {
  console.log('🗑️  Starting customer deletion process...\n')

  try {
    // Step 1: Get all customer user IDs
    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    console.log(`📊 Found ${customers.length} customers to delete\n`)

    const customerIds = customers.length > 0 ? customers.map(c => c.id) : []

    // Step 2: Get ALL bookings (including guest bookings) to ensure revenue is completely reset
    const allBookings = await prisma.booking.findMany({
      select: {
        id: true,
        bookingNumber: true,
        userId: true
      }
    })

    const customerBookings = customerIds.length > 0 
      ? allBookings.filter(b => customerIds.includes(b.userId))
      : []
    
    console.log(`📋 Found ${allBookings.length} total bookings (${customerBookings.length} from customers, ${allBookings.length - customerBookings.length} guest bookings)\n`)

    const allBookingIds = allBookings.map(b => b.id)

    // Initialize counters for summary
    let paymentsDeletedCount = 0
    let feeLedgersDeletedCount = 0

    // Step 3: Delete ALL revenue-related data (even if orphaned)
    console.log('🗑️  Deleting ALL revenue-related data...')

    // Delete ALL BookingFeeLedger entries (completely reset revenue tracking)
    const feeLedgersDeleted = await prisma.bookingFeeLedger.deleteMany({})
    feeLedgersDeletedCount = feeLedgersDeleted.count
    console.log(`   ✓ Deleted ${feeLedgersDeleted.count} booking fee ledger entries (all revenue tracking cleared)`)

    // Delete ALL Payment records (complete revenue reset)
    const allPaymentsDeleted = await prisma.payment.deleteMany({})
    paymentsDeletedCount = allPaymentsDeleted.count
    console.log(`   ✓ Deleted ${allPaymentsDeleted.count} payment records (all revenue cleared)\n`)

    // Step 4: Delete ALL booking-related data (complete reset)
    if (allBookingIds.length > 0) {
      console.log('🗑️  Deleting ALL booking-related data...')

      // Delete BookingAddOn entries
      const addOnsDeleted = await prisma.bookingAddOn.deleteMany({})
      console.log(`   ✓ Deleted ${addOnsDeleted.count} booking add-ons`)

      // Delete Contracts
      const contractsDeleted = await prisma.contract.deleteMany({})
      console.log(`   ✓ Deleted ${contractsDeleted.count} contracts`)

      // Delete DamageReports
      const damageReportsDeleted = await prisma.damageReport.deleteMany({})
      console.log(`   ✓ Deleted ${damageReportsDeleted.count} damage reports`)

      // Delete ALL Bookings (complete reset)
      const bookingsDeleted = await prisma.booking.deleteMany({})
      console.log(`   ✓ Deleted ${bookingsDeleted.count} bookings (all bookings cleared)\n`)
    }

    // Step 5: Delete user-related data
    console.log('🗑️  Deleting user-related data...')

    // Delete Notifications for customers
    const notificationsDeleted = await prisma.notification.deleteMany({
      where: {
        userId: { in: customerIds }
      }
    })
    console.log(`   ✓ Deleted ${notificationsDeleted.count} notifications`)

    // Delete Sessions
    const sessionsDeleted = await prisma.session.deleteMany({
      where: {
        userId: { in: customerIds }
      }
    })
    console.log(`   ✓ Deleted ${sessionsDeleted.count} sessions`)

    // Delete Accounts (auth accounts if any)
    const accountsDeleted = await prisma.account.deleteMany({
      where: {
        userId: { in: customerIds }
      }
    })
    console.log(`   ✓ Deleted ${accountsDeleted.count} accounts`)

    // Delete PaymentMethods (should cascade, but being explicit)
    const paymentMethodsDeleted = await prisma.paymentMethod.deleteMany({
      where: {
        userId: { in: customerIds }
      }
    })
    console.log(`   ✓ Deleted ${paymentMethodsDeleted.count} payment methods`)

    // Step 6: Finally delete the customers themselves (if any exist)
    let customersDeletedCount = 0
    if (customerIds.length > 0) {
      console.log('\n🗑️  Deleting customers...')
      const customersDeleted = await prisma.user.deleteMany({
        where: {
          id: { in: customerIds }
        }
      })
      customersDeletedCount = customersDeleted.count
      console.log(`   ✓ Deleted ${customersDeleted.count} customers\n`)
    } else {
      console.log('\nℹ️  No customers to delete (revenue reset only)\n')
    }

    console.log('✅ Revenue reset completed successfully!')
    console.log(`\n📊 Summary:`)
    console.log(`   - Customers deleted: ${customersDeletedCount}`)
    console.log(`   - Total bookings deleted: ${allBookings.length} (all bookings cleared)`)
    console.log(`   - All payments deleted: ${paymentsDeletedCount} (revenue reset to 0)`)
    console.log(`   - All fee ledger entries deleted: ${feeLedgersDeletedCount} (revenue tracking cleared)`)
    console.log(`   ✅ Revenue completely reset - all bookings, payments and fee records removed`)

  } catch (error) {
    console.error('❌ Error deleting customers:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
deleteCustomers()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

