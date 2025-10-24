#!/usr/bin/env tsx

/**
 * Update Vehicles Script
 * 
 * This script updates existing vehicles in the database with new Midwest Luxury data
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const newVehicles = [
  {
    id: '1',
    slug: 'ferrari-488-gtb-black',
    displayName: '2024 Ferrari 488 GTB',
    make: 'Ferrari',
    model: '488 GTB',
    year: 2024,
    category: 'SUPERCAR',
    bodyType: 'COUPE',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    drivetrain: 'RWD',
    seats: 2,
    doors: 2,
    engineSize: 3.9,
    engineType: 'V8 Twin-Turbo',
    horsePower: 670,
    torque: 760,
    topSpeed: 330,
    acceleration: 3.0,
    fuelConsumption: 11.4,
    features: ['F1-Trac Traction Control', 'E-Diff3 Electronic Differential', 'Ferrari Dynamic Enhancer', 'LED Headlights', 'Premium Leather Interior'],
    primaryImageUrl: '/Ferrari 488 - black.jpg',
    basePricePerDay: 2999,
    description: 'Experience the pinnacle of Italian automotive excellence with the Ferrari 488 GTB. This mid-engine supercar features a 3.9-liter V8 twin-turbo engine producing 670 horsepower, accelerating from 0-100 km/h in just 3.0 seconds. With its F1-derived aerodynamics, advanced traction control systems, and iconic Ferrari styling, the 488 GTB represents the perfect fusion of performance and artistry. Available at 2,999 AED per day.'
  },
  {
    id: '2',
    slug: 'ferrari-488-gtb-red',
    displayName: '2024 Ferrari 488 GTB Red',
    make: 'Ferrari',
    model: '488 GTB',
    year: 2024,
    category: 'SUPERCAR',
    bodyType: 'COUPE',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    drivetrain: 'RWD',
    seats: 2,
    doors: 2,
    engineSize: 3.9,
    engineType: 'V8 Twin-Turbo',
    horsePower: 670,
    torque: 760,
    topSpeed: 330,
    acceleration: 3.0,
    fuelConsumption: 11.4,
    features: ['F1-Trac Traction Control', 'E-Diff3 Electronic Differential', 'Ferrari Dynamic Enhancer', 'LED Headlights', 'Premium Leather Interior'],
    primaryImageUrl: '/Ferrari 488 - red.jpg',
    basePricePerDay: 2999,
    description: 'Experience the pinnacle of Italian automotive excellence with the Ferrari 488 GTB in iconic Rosso Corsa. This mid-engine supercar features a 3.9-liter V8 twin-turbo engine producing 670 horsepower, accelerating from 0-100 km/h in just 3.0 seconds. With its F1-derived aerodynamics, advanced traction control systems, and iconic Ferrari styling in the classic red finish, the 488 GTB represents the perfect fusion of performance and artistry. Available at 2,999 AED per day.'
  },
  {
    id: '3',
    slug: 'mercedes-g63-amg',
    displayName: '2024 Mercedes-Benz G63 AMG',
    make: 'Mercedes-Benz',
    model: 'G63 AMG',
    year: 2024,
    category: 'SUV',
    bodyType: 'SUV',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    drivetrain: 'AWD',
    seats: 5,
    doors: 4,
    engineSize: 4.0,
    engineType: 'V8 Twin-Turbo',
    horsePower: 577,
    torque: 627,
    topSpeed: 220,
    acceleration: 4.5,
    fuelConsumption: 13.1,
    features: ['AMG Performance Exhaust', 'AMG Ride Control Suspension', 'Burmester Premium Sound', 'AMG Night Package', 'Panoramic Sunroof'],
    primaryImageUrl: '/G63-white.jpg',
    basePricePerDay: 1999,
    description: 'Experience the ultimate luxury SUV with the Mercedes-Benz G63 AMG. This iconic off-road legend features a 4.0-liter V8 twin-turbo engine producing 577 horsepower, accelerating from 0-100 km/h in just 4.5 seconds. With its legendary three-locking differentials, adaptive air suspension, and opulent interior featuring Burmester premium sound, the G63 AMG combines uncompromising off-road capability with supreme luxury. Available at 1,999 AED per day.'
  },
  {
    id: '4',
    slug: 'lamborghini-urus-performante',
    displayName: '2024 Lamborghini Urus Performante',
    make: 'Lamborghini',
    model: 'Urus Performante',
    year: 2024,
    category: 'SUV',
    bodyType: 'SUV',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    drivetrain: 'AWD',
    seats: 5,
    doors: 4,
    engineSize: 4.0,
    engineType: 'V8 Twin-Turbo',
    horsePower: 666,
    torque: 627,
    topSpeed: 306,
    acceleration: 3.3,
    fuelConsumption: 12.7,
    features: ['Performante Aerodynamics', 'Adaptive Air Suspension', 'Carbon Ceramic Brakes', 'Lamborghini Infotainment', 'Premium Leather Interior'],
    primaryImageUrl: '/Lamborghini Urus Performante Blue.jpg',
    basePricePerDay: 2499,
    description: 'Experience the ultimate super SUV with the Lamborghini Urus Performante. This high-performance SUV features a 4.0-liter V8 twin-turbo engine producing 666 horsepower, accelerating from 0-100 km/h in just 3.3 seconds. With its Performante aerodynamics, adaptive air suspension, and carbon ceramic brakes, the Urus Performante delivers supercar performance in an SUV package. Available at 2,499 AED per day.'
  },
  {
    id: '5',
    slug: 'mclaren-720s',
    displayName: '2024 McLaren 720S',
    make: 'McLaren',
    model: '720S',
    year: 2024,
    category: 'SUPERCAR',
    bodyType: 'COUPE',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    drivetrain: 'RWD',
    seats: 2,
    doors: 2,
    engineSize: 4.0,
    engineType: 'V8 Twin-Turbo',
    horsePower: 710,
    torque: 568,
    topSpeed: 341,
    acceleration: 2.9,
    fuelConsumption: 10.7,
    features: ['Active Aerodynamics', 'ProActive Chassis Control', 'McLaren Track Telemetry', 'Bowers & Wilkins Audio', 'Carbon Fiber Monocage'],
    primaryImageUrl: '/McLaren Blue.jpg',
    basePricePerDay: 3499,
    description: 'Experience the pinnacle of British supercar engineering with the McLaren 720S. This mid-engine masterpiece features a 4.0-liter V8 twin-turbo engine producing 710 horsepower, accelerating from 0-100 km/h in just 2.9 seconds. With its active aerodynamics, ProActive chassis control, and carbon fiber monocage, the 720S delivers Formula 1-inspired performance on the road. Available at 3,499 AED per day.'
  },
  {
    id: '6',
    slug: 'lamborghini-urus-hulk',
    displayName: '2024 Lamborghini Urus Hulk Green',
    make: 'Lamborghini',
    model: 'Urus',
    year: 2024,
    category: 'SUV',
    bodyType: 'SUV',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    drivetrain: 'AWD',
    seats: 5,
    doors: 4,
    engineSize: 4.0,
    engineType: 'V8 Twin-Turbo',
    horsePower: 641,
    torque: 627,
    topSpeed: 305,
    acceleration: 3.6,
    fuelConsumption: 12.7,
    features: ['Adaptive Air Suspension', 'Carbon Ceramic Brakes', 'Lamborghini Infotainment', 'Premium Leather Interior', 'Sport Exhaust System'],
    primaryImageUrl: '/Urus Hulk Green.jpg',
    basePricePerDay: 2299,
    description: 'Experience the ultimate super SUV with the Lamborghini Urus in striking Hulk Green. This high-performance SUV features a 4.0-liter V8 twin-turbo engine producing 641 horsepower, accelerating from 0-100 km/h in just 3.6 seconds. With its adaptive air suspension, carbon ceramic brakes, and distinctive green finish, the Urus delivers supercar performance in an SUV package. Available at 2,299 AED per day.'
  }
]

async function updateVehicles() {
  console.log('🚗 Starting vehicle update...')
  
  try {
    // First, delete all existing vehicles
    console.log('🗑️  Deleting existing vehicles...')
    await prisma.car.deleteMany()
    console.log('   ✓ All existing vehicles deleted')

    // Create new vehicles
    console.log('➕ Creating new vehicles...')
    for (const vehicleData of newVehicles) {
      const vehicle = await prisma.car.create({
        data: {
          slug: vehicleData.slug,
          displayName: vehicleData.displayName,
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          category: vehicleData.category as any,
          bodyType: vehicleData.bodyType as any,
          transmission: vehicleData.transmission as any,
          fuelType: vehicleData.fuelType as any,
          drivetrain: vehicleData.drivetrain as any,
          seats: vehicleData.seats,
          doors: vehicleData.doors,
          engineSize: vehicleData.engineSize,
          engineType: vehicleData.engineType,
          horsePower: vehicleData.horsePower,
          torque: vehicleData.torque,
          topSpeed: vehicleData.topSpeed,
          acceleration: vehicleData.acceleration,
          fuelConsumption: vehicleData.fuelConsumption,
          features: vehicleData.features,
          primaryImageUrl: vehicleData.primaryImageUrl,
          description: vehicleData.description,
          status: 'ACTIVE',
          featured: true,
          featuredOrder: parseInt(vehicleData.id),
          licensePlate: `DXB-${vehicleData.make.toUpperCase().substring(0, 3)}${vehicleData.id}`,
          vin: `VIN${vehicleData.id}${Date.now()}`,
          trim: vehicleData.model,
          basePricePerDay: vehicleData.basePricePerDay,
          depositAmount: 0
        }
      })

      // Create price rule for the vehicle
      await prisma.priceRule.create({
        data: {
          carId: vehicle.id,
          basePricePerDay: vehicleData.basePricePerDay,
          weekendMultiplier: 1.0,
          weeklyDiscount: 0,
          monthlyDiscount: 0,
          minimumDays: 1,
          maximumDays: 30,
          includedKmPerDay: 250,
          extraKmPrice: 3,
          depositAmount: 0,
          isActive: true,
          validFrom: new Date(),
          validUntil: null
        }
      })

      console.log(`   ✓ Created ${vehicleData.displayName}`)
    }

    console.log('✅ All vehicles updated successfully!')
    console.log('🎉 Database update completed!')

  } catch (error) {
    console.error('❌ Error during update:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the update
updateVehicles()
  .then(() => {
    console.log('🏁 Update script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Update script failed:', error)
    process.exit(1)
  })
