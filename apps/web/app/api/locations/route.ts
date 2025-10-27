import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@valore/database'

export async function GET(request: NextRequest) {
  try {
    // For now, we'll return static locations with proper addresses
    // In a production system, these would be stored in the database
    const locations = [
      {
        id: 'showroom',
        name: 'Midwest Luxury Rentals Showroom',
        address: 'Chicago, IL',
        type: 'SHOWROOM',
        isDefault: true
      },
      {
        id: 'airport-ord',
        name: "O'Hare International Airport (ORD)",
        address: 'Chicago, IL',
        type: 'AIRPORT',
        isDefault: false
      },
      {
        id: 'airport-mdw',
        name: 'Midway International Airport (MDW)',
        address: 'Chicago, IL',
        type: 'AIRPORT',
        isDefault: false
      },
      {
        id: 'hotel',
        name: 'Hotel Delivery',
        address: 'Your Hotel Address (Chicago Area)',
        type: 'HOTEL',
        isDefault: false
      }
    ]

    return NextResponse.json(locations)
  } catch (error) {
    console.error('Failed to fetch locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
