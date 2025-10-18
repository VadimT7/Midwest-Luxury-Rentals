import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@valore/database'

// GET all settings or specific setting by key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const category = searchParams.get('category')

    if (key) {
      // Get specific setting
      // @ts-ignore - SystemSettings model will be available after prisma generate
      const setting = await prisma.systemSettings?.findUnique({
        where: { key }
      })
      
      if (!setting) {
        return NextResponse.json(
          { error: 'Setting not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(setting)
    }

    // Get all settings or filter by category
    const where = category ? { category } : {}
    // @ts-ignore - SystemSettings model will be available after prisma generate
    const settings = await prisma.systemSettings?.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    }) || []

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// UPDATE a setting
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      )
    }

    // Validate currency values
    if (key === 'payment_currency' && !['CAD', 'USD'].includes(value)) {
      return NextResponse.json(
        { error: 'Invalid currency. Must be CAD or USD' },
        { status: 400 }
      )
    }

    // @ts-ignore - SystemSettings model will be available after prisma generate
    const setting = await prisma.systemSettings?.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
        description: body.description,
        category: body.category || 'general'
      }
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Failed to update setting:', error)
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    )
  }
}

// Batch update settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Settings must be an array' },
        { status: 400 }
      )
    }

    const results = await Promise.all(
      settings.map(async ({ key, value }) => {
        // Validate currency values
        if (key === 'payment_currency' && !['CAD', 'USD'].includes(value)) {
          throw new Error(`Invalid currency for ${key}: ${value}`)
        }

        // @ts-ignore - SystemSettings model will be available after prisma generate
        return prisma.systemSettings?.upsert({
          where: { key },
          update: { value },
          create: {
            key,
            value,
            category: 'general'
          }
        })
      })
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('Failed to batch update settings:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    )
  }
}
