import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@valore/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    console.log('👥 Fetching customers for admin dashboard...')

    // Fetch customers with their booking count (including all statuses)
    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        // Remove status filter to show all customers
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        Booking: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            totalAmount: true,
            startDate: true,
            endDate: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5, // Latest 5 bookings per customer
        },
        _count: {
          select: {
            Booking: true,
          }
        }
      },
    })

    // Transform the data to match the expected format
    const transformedCustomers = customers.map((customer: any) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      totalBookings: customer._count.Booking,
      totalSpent: customer.Booking.reduce((sum: number, booking: any) => sum + parseFloat(String(booking.totalAmount)), 0),
      recentBookings: customer.Booking,
    }))

    console.log(`✅ Found ${transformedCustomers.length} customers`)

    return NextResponse.json(transformedCustomers)
  } catch (error) {
    console.error('❌ Failed to fetch customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('🔄 Admin customer update API called')
    
    const { customerId, status } = await request.json()

    if (!customerId || !status) {
      return NextResponse.json(
        { error: 'Missing customerId or status' },
        { status: 400 }
      )
    }

    console.log(`📝 Updating customer ${customerId} to status: ${status}`)

    // Update the customer status in the database
    const updatedCustomer = await prisma.user.update({
      where: { id: customerId },
      data: { 
        status: status as any,
        updatedAt: new Date()
      },
      include: {
        Booking: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            totalAmount: true,
            startDate: true,
            endDate: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            Booking: true,
          }
        }
      },
    })

    console.log(`✅ Customer ${customerId} updated successfully to ${status}`)

    return NextResponse.json({
      success: true,
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        status: updatedCustomer.status,
        updatedAt: updatedCustomer.updatedAt,
      }
    })
  } catch (error) {
    console.error('❌ Failed to update customer:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update customer',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

