#!/usr/bin/env tsx

/**
 * Script to delete all customers and their associated data
 * This will remove:
 * - All users with role CUSTOMER
 * - All bookings from those customers
 * - All payments associated with those bookings
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

    if (customers.length === 0) {
      console.log('✅ No customers found. Nothing to delete.')
      return
    }

    const customerIds = customers.map(c => c.id)

    // Step 2: Get all bookings from customers
    const bookings = await prisma.booking.findMany({
      where: {
        userId: { in: customerIds }
      },
      select: {
        id: true,
        bookingNumber: true
      }
    })

    console.log(`📋 Found ${bookings.length} bookings associated with customers\n`)

    const bookingIds = bookings.map(b => b.id)

    // Initialize counters for summary
    let paymentsDeletedCount = 0

    // Step 3: Delete booking-related data (in correct order due to foreign keys)
    if (bookingIds.length > 0) {
      console.log('🗑️  Deleting booking-related data...')

      // Delete BookingFeeLedger entries
      const feeLedgersDeleted = await prisma.bookingFeeLedger.deleteMany({
        where: {
          bookingId: { in: bookingIds }
        }
      })
      console.log(`   ✓ Deleted ${feeLedgersDeleted.count} booking fee ledger entries`)

      // Delete BookingAddOn entries
      const addOnsDeleted = await prisma.bookingAddOn.deleteMany({
        where: {
          bookingId: { in: bookingIds }
        }
      })
      console.log(`   ✓ Deleted ${addOnsDeleted.count} booking add-ons`)

      // Delete Contracts
      const contractsDeleted = await prisma.contract.deleteMany({
        where: {
          bookingId: { in: bookingIds }
        }
      })
      console.log(`   ✓ Deleted ${contractsDeleted.count} contracts`)

      // Delete DamageReports
      const damageReportsDeleted = await prisma.damageReport.deleteMany({
        where: {
          bookingId: { in: bookingIds }
        }
      })
      console.log(`   ✓ Deleted ${damageReportsDeleted.count} damage reports`)

      // Delete Payments (these should cascade, but being explicit)
      const paymentsDeleted = await prisma.payment.deleteMany({
        where: {
          bookingId: { in: bookingIds }
        }
      })
      paymentsDeletedCount = paymentsDeleted.count
      console.log(`   ✓ Deleted ${paymentsDeleted.count} payments`)

      // Delete Bookings
      const bookingsDeleted = await prisma.booking.deleteMany({
        where: {
          id: { in: bookingIds }
        }
      })
      console.log(`   ✓ Deleted ${bookingsDeleted.count} bookings\n`)
    }

    // Step 4: Delete user-related data
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

    // Step 5: Finally delete the customers themselves
    console.log('\n🗑️  Deleting customers...')
    const customersDeleted = await prisma.user.deleteMany({
      where: {
        id: { in: customerIds }
      }
    })
    console.log(`   ✓ Deleted ${customersDeleted.count} customers\n`)

    console.log('✅ Customer deletion completed successfully!')
    console.log(`\n📊 Summary:`)
    console.log(`   - Customers deleted: ${customersDeleted.count}`)
    console.log(`   - Bookings deleted: ${bookings.length}`)
    console.log(`   - Payments deleted: ${paymentsDeletedCount}`)
    console.log(`   - Total revenue records removed: ${paymentsDeletedCount} payments`)

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

