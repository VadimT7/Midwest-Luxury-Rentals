import { PrismaClient } from '@prisma/client'
import { addDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Falcon Flair database...')

  // Clear existing data
  console.log('Clearing existing data...')
  // Clear in correct order to respect foreign key constraints
  await prisma.carImage.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.bookingAddOn.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.addOn.deleteMany()
  await prisma.seasonalRate.deleteMany()
  await prisma.priceRule.deleteMany()
  await prisma.car.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.paymentMethod.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  console.log('Creating admin user...')
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@falconflair.ae',
      name: 'Falcon Flair Admin',
      phone: '+971585046440',
      role: 'ADMIN',
      status: 'ACTIVE',
      isVerified: true,
    },
  })

  // Create test customer
  console.log('Creating test customer...')
  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      name: 'Test Customer',
      phone: '+971501234567',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isVerified: true,
    },
  })

  // Create vehicles for Falcon Flair
  console.log('Creating Falcon Flair vehicles...')
  
  // 1. BMW M440 Coupé
  const bmwM440 = await prisma.car.create({
    data: {
      slug: 'bmw-m440-coupe-2025',
      displayName: '2025 BMW M440 Coupé',
      make: 'BMW',
      model: 'M440 Coupé',
      year: 2025,
      category: 'LUXURY',
      bodyType: 'COUPE',
      drivetrain: 'AWD',
      status: 'ACTIVE',
      featured: true,
      featuredOrder: 1,
      primaryImageUrl: '/placeholder-car.jpg',
      description: 'Experience the perfect blend of luxury and performance with the BMW M440 Coupé. With 374 HP and a 0-100 km/h time of just 4.5 seconds, this coupe delivers an exhilarating driving experience wrapped in sophisticated style.',
      features: [
        'M Sport Package',
        'Adaptive LED Headlights',
        'Harman Kardon Sound System',
        'Wireless Apple CarPlay',
        'Sport Exhaust System',
        'M Sport Differential',
        'Parking Assistant Plus',
        'BMW Live Cockpit Professional'
      ],
      doors: 2,
      seats: 4,
      transmission: 'AUTOMATIC',
      engineSize: 3.0,
      engineType: 'Inline-6 Turbo',
      fuelType: 'PETROL',
      horsePower: 374,
      torque: 500,
      topSpeed: 250,
      acceleration: 4.5,
      fuelConsumption: 8.5,
      vin: 'WBA53AK01P7C12345',
      licensePlate: 'DXB M440',
      images: {
        create: [
          { url: '/placeholder-car.jpg', alt: 'BMW M440 Front View', order: 1 },
          { url: '/placeholder-car.jpg', alt: 'BMW M440 Side View', order: 2 },
          { url: '/placeholder-car.jpg', alt: 'BMW M440 Interior', order: 3 }
        ]
      },
      priceRules: {
        create: {
          basePricePerDay: 699,
          currency: 'AED',
          weekendMultiplier: 1.1,
          weeklyDiscount: 0.1,
          monthlyDiscount: 0.15,
          minimumDays: 1,
          includedKmPerDay: 250,
          extraKmPrice: 5,
          depositAmount: 2000,
          isActive: true
        }
      }
    }
  })

  // 2. Mercedes-Benz CLE 53 AMG
  const cle53AMG = await prisma.car.create({
    data: {
      slug: 'mercedes-cle-53-amg-2025',
      displayName: 'Mercedes-Benz CLE 53 AMG',
      make: 'Mercedes-Benz',
      model: 'CLE 53 AMG',
      year: 2025,
      category: 'LUXURY',
      bodyType: 'COUPE',
      drivetrain: 'AWD',
      status: 'ACTIVE',
      featured: true,
      featuredOrder: 2,
      primaryImageUrl: '/placeholder-car.jpg',
      description: 'The Mercedes-Benz CLE 53 AMG combines breathtaking performance with supreme luxury. With 443 HP and AMG-enhanced dynamics, it accelerates from 0-100 km/h in just 4.0 seconds.',
      features: [
        'AMG Performance Package',
        'MBUX Infotainment System',
        'Burmester 3D Sound System',
        'AMG Ride Control Suspension',
        'AMG Performance Steering Wheel',
        'Ambient Lighting 64 Colors',
        'Head-Up Display',
        'AMG Track Pace'
      ],
      doors: 2,
      seats: 4,
      transmission: 'AUTOMATIC',
      engineSize: 3.0,
      engineType: 'Inline-6 Turbo + Hybrid',
      fuelType: 'PETROL',
      horsePower: 443,
      torque: 560,
      topSpeed: 270,
      acceleration: 4.0,
      fuelConsumption: 9.2,
      vin: 'W1K5J5KB7PA123456',
      licensePlate: 'DXB CLE53',
      images: {
        create: [
          { url: '/placeholder-car.jpg', alt: 'CLE 53 AMG Front View', order: 1 },
          { url: '/placeholder-car.jpg', alt: 'CLE 53 AMG Side View', order: 2 },
          { url: '/placeholder-car.jpg', alt: 'CLE 53 AMG Interior', order: 3 }
        ]
      },
      priceRules: {
        create: {
          basePricePerDay: 699,
          currency: 'AED',
          weekendMultiplier: 1.1,
          weeklyDiscount: 0.1,
          monthlyDiscount: 0.15,
          minimumDays: 1,
          includedKmPerDay: 250,
          extraKmPrice: 5,
          depositAmount: 2000,
          isActive: true
        }
      }
    }
  })

  // 3. Mercedes-Benz C43 AMG
  const c43AMG = await prisma.car.create({
    data: {
      slug: 'mercedes-c43-amg-2025',
      displayName: 'Mercedes-Benz C43 AMG',
      make: 'Mercedes-Benz',
      model: 'C43 AMG',
      year: 2025,
      category: 'SPORT',
      bodyType: 'SEDAN',
      drivetrain: 'AWD',
      status: 'ACTIVE',
      featured: true,
      featuredOrder: 3,
      primaryImageUrl: '/placeholder-car.jpg',
      description: 'The Mercedes-Benz C43 AMG delivers AMG performance in a compact package. With 408 HP and sophisticated 4MATIC all-wheel drive.',
      features: [
        'AMG Sport Package',
        'MBUX Interior Assistant',
        'Burmester Sound System',
        'AMG Performance Exhaust',
        'Digital Instrument Cluster',
        'Wireless Charging',
        'Adaptive Cruise Control',
        'Blind Spot Assist'
      ],
      doors: 4,
      seats: 5,
      transmission: 'AUTOMATIC',
      engineSize: 2.0,
      engineType: '4-Cylinder Turbo + Hybrid',
      fuelType: 'PETROL',
      horsePower: 408,
      torque: 500,
      topSpeed: 250,
      acceleration: 4.6,
      fuelConsumption: 7.8,
      vin: 'W1KZF8KB3SA234567',
      licensePlate: 'DXB C43',
      images: {
        create: [
          { url: '/placeholder-car.jpg', alt: 'C43 AMG Front View', order: 1 },
          { url: '/placeholder-car.jpg', alt: 'C43 AMG Side View', order: 2 },
          { url: '/placeholder-car.jpg', alt: 'C43 AMG Interior', order: 3 }
        ]
      },
      priceRules: {
        create: {
          basePricePerDay: 499,
          currency: 'AED',
          weekendMultiplier: 1.1,
          weeklyDiscount: 0.1,
          monthlyDiscount: 0.15,
          minimumDays: 1,
          includedKmPerDay: 250,
          extraKmPrice: 5,
          depositAmount: 1500,
          isActive: true
        }
      }
    }
  })

  // 4. ROX 01 VIP
  const rox01 = await prisma.car.create({
    data: {
      slug: 'rox-01-vip-2025',
      displayName: '2025 ROX 01 VIP',
      make: 'ROX',
      model: '01 VIP',
      year: 2025,
      category: 'SUV',
      bodyType: 'SUV',
      drivetrain: 'AWD',
      status: 'ACTIVE',
      featured: true,
      featuredOrder: 4,
      primaryImageUrl: '/placeholder-car.jpg',
      description: 'The revolutionary ROX 01 VIP combines luxury SUV styling with cutting-edge plug-in hybrid technology. With an impressive 1300 km range.',
      features: [
        'Plug-in Hybrid System',
        '1300 km Total Range',
        'Panoramic Glass Roof',
        'Executive Rear Seats',
        'Advanced Air Suspension',
        '360° Camera System',
        'Premium Leather Interior',
        'Wireless Device Charging',
        'Matrix LED Headlights',
        'Autonomous Driving Features'
      ],
      doors: 4,
      seats: 7,
      transmission: 'AUTOMATIC',
      engineSize: 2.0,
      engineType: '4-Cylinder + Electric Motor',
      fuelType: 'HYBRID',
      horsePower: 400,
      torque: 650,
      topSpeed: 210,
      acceleration: 5.5,
      fuelConsumption: 2.5,
      vin: 'ROXVIP2025A001234',
      licensePlate: 'DXB ROX1',
      images: {
        create: [
          { url: '/placeholder-car.jpg', alt: 'ROX 01 VIP Front View', order: 1 },
          { url: '/placeholder-car.jpg', alt: 'ROX 01 VIP Side View', order: 2 },
          { url: '/placeholder-car.jpg', alt: 'ROX 01 VIP Interior', order: 3 }
        ]
      },
      priceRules: {
        create: {
          basePricePerDay: 699,
          currency: 'AED',
          weekendMultiplier: 1.1,
          weeklyDiscount: 0.1,
          monthlyDiscount: 0.15,
          minimumDays: 1,
          includedKmPerDay: 300,
          extraKmPrice: 5,
          depositAmount: 0,
          isActive: true
        }
      }
    }
  })

  // 5. Audi RS3 Hatchback Daytona Grey
  const rs3Daytona = await prisma.car.create({
    data: {
      slug: 'audi-rs3-daytona-grey-2025',
      displayName: 'Audi RS3 Hatchback - Daytona Grey',
      make: 'Audi',
      model: 'RS3 Sportback',
      year: 2025,
      category: 'SPORT',
      bodyType: 'HATCHBACK',
      drivetrain: 'AWD',
      status: 'ACTIVE',
      featured: true,
      featuredOrder: 5,
      primaryImageUrl: '/placeholder-car.jpg',
      description: 'The Audi RS3 in stunning Daytona Grey delivers supercar performance in a practical hatchback body. 400 HP and 0-100 km/h in just 3.8 seconds.',
      features: [
        'RS Sport Exhaust System',
        'Quattro All-Wheel Drive',
        'RS Sport Suspension Plus',
        'Bang & Olufsen Sound System',
        'Virtual Cockpit Plus',
        'RS Sport Seats',
        'Launch Control',
        'RS Torque Splitter'
      ],
      doors: 5,
      seats: 5,
      transmission: 'AUTOMATIC',
      engineSize: 2.5,
      engineType: '5-Cylinder Turbo',
      fuelType: 'PETROL',
      horsePower: 400,
      torque: 500,
      topSpeed: 290,
      acceleration: 3.8,
      fuelConsumption: 8.8,
      vin: 'WUABWGFF9P1234567',
      licensePlate: 'DXB RS3D',
      images: {
        create: [
          { url: '/placeholder-car.jpg', alt: 'RS3 Daytona Front View', order: 1 },
          { url: '/placeholder-car.jpg', alt: 'RS3 Daytona Side View', order: 2 },
          { url: '/placeholder-car.jpg', alt: 'RS3 Daytona Interior', order: 3 }
        ]
      },
      priceRules: {
        create: {
          basePricePerDay: 699,
          currency: 'AED',
          weekendMultiplier: 1.1,
          weeklyDiscount: 0.1,
          monthlyDiscount: 0.15,
          minimumDays: 1,
          includedKmPerDay: 250,
          extraKmPrice: 5,
          depositAmount: 2000,
          isActive: true
        }
      }
    }
  })

  // 6. Audi RS3 Hatchback Black
  const rs3Black = await prisma.car.create({
    data: {
      slug: 'audi-rs3-black-2025',
      displayName: 'Audi RS3 Hatchback - Mythos Black',
      make: 'Audi',
      model: 'RS3 Sportback',
      year: 2025,
      category: 'SPORT',
      bodyType: 'HATCHBACK',
      drivetrain: 'AWD',
      status: 'ACTIVE',
      featured: true,
      featuredOrder: 6,
      primaryImageUrl: '/placeholder-car.jpg',
      description: 'The Audi RS3 in menacing Mythos Black combines explosive performance with everyday practicality. Its award-winning 5-cylinder engine produces 400 HP.',
      features: [
        'RS Sport Exhaust System',
        'Quattro All-Wheel Drive',
        'RS Sport Suspension Plus',
        'Bang & Olufsen Sound System',
        'Virtual Cockpit Plus',
        'RS Sport Seats',
        'Launch Control',
        'RS Torque Splitter'
      ],
      doors: 5,
      seats: 5,
      transmission: 'AUTOMATIC',
      engineSize: 2.5,
      engineType: '5-Cylinder Turbo',
      fuelType: 'PETROL',
      horsePower: 400,
      torque: 500,
      topSpeed: 290,
      acceleration: 3.8,
      fuelConsumption: 8.8,
      vin: 'WUABWGFF9P1345678',
      licensePlate: 'DXB RS3B',
      images: {
        create: [
          { url: '/placeholder-car.jpg', alt: 'RS3 Black Front View', order: 1 },
          { url: '/placeholder-car.jpg', alt: 'RS3 Black Side View', order: 2 },
          { url: '/placeholder-car.jpg', alt: 'RS3 Black Interior', order: 3 }
        ]
      },
      priceRules: {
        create: {
          basePricePerDay: 699,
          currency: 'AED',
          weekendMultiplier: 1.1,
          weeklyDiscount: 0.1,
          monthlyDiscount: 0.15,
          minimumDays: 1,
          includedKmPerDay: 250,
          extraKmPrice: 5,
          depositAmount: 2000,
          isActive: true
        }
      }
    }
  })

  const vehicles = [bmwM440, cle53AMG, c43AMG, rox01, rs3Daytona, rs3Black]

  // Create availability for all vehicles (next 90 days)
  console.log('Creating availability data...')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const vehicle of vehicles) {
    const availabilityData = []
    for (let i = 0; i < 90; i++) {
      const date = addDays(today, i)
      availabilityData.push({
        carId: vehicle.id,
        date: date,
        isAvailable: true,
      })
    }
    await prisma.availability.createMany({
      data: availabilityData,
    })
  }

  // Create add-ons
  console.log('Creating add-ons...')
  const addons = await Promise.all([
    prisma.addOn.create({
      data: {
        slug: 'comprehensive-insurance',
        name: 'Comprehensive Insurance',
        description: 'Full coverage with zero deductible',
        price: 150,
        priceType: 'PER_DAY',
        currency: 'AED',
        category: 'INSURANCE',
        isActive: true,
      },
    }),
    prisma.addOn.create({
      data: {
        slug: 'additional-driver',
        name: 'Additional Driver',
        description: 'Add an extra driver to your rental agreement',
        price: 50,
        priceType: 'PER_BOOKING',
        currency: 'AED',
        category: 'SERVICE',
        isActive: true,
      },
    }),
    prisma.addOn.create({
      data: {
        slug: 'child-safety-seat',
        name: 'Child Safety Seat',
        description: 'Premium child safety seat',
        price: 30,
        priceType: 'PER_DAY',
        currency: 'AED',
        category: 'EQUIPMENT',
        isActive: true,
      },
    }),
    prisma.addOn.create({
      data: {
        slug: 'gps-navigation',
        name: 'GPS Navigation',
        description: 'Premium GPS navigation system',
        price: 25,
        priceType: 'PER_DAY',
        currency: 'AED',
        category: 'EQUIPMENT',
        isActive: true,
      },
    }),
    prisma.addOn.create({
      data: {
        slug: 'airport-delivery',
        name: 'Airport Delivery',
        description: 'Vehicle delivery to Dubai International Airport',
        price: 100,
        priceType: 'PER_BOOKING',
        currency: 'AED',
        category: 'SERVICE',
        isActive: true,
      },
    }),
  ])

  console.log('✅ Database seeded successfully!')
  console.log('📧 Admin login: admin@falconflair.ae')
  console.log('🚗 Created 6 luxury vehicles:')
  console.log('   - BMW M440 Coupé (699 AED/day)')
  console.log('   - Mercedes CLE 53 AMG (699 AED/day)')
  console.log('   - Mercedes C43 AMG (499 AED/day)')
  console.log('   - ROX 01 VIP (699 AED/day - NO DEPOSIT)')
  console.log('   - Audi RS3 Daytona Grey (699 AED/day)')
  console.log('   - Audi RS3 Mythos Black (699 AED/day)')
  console.log('📅 Created 90 days of availability')
  console.log('➕ Created 5 add-ons')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })