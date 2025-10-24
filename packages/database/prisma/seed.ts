import { PrismaClient, Role, CarCategory, BodyType, TransmissionType, FuelType, DrivetrainType, AddOnCategory, PriceType, UserStatus, DiscountType } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

// Luxury car data for Midwest Luxury Rentals fleet
const LUXURY_CARS = [
  {
    make: 'Ferrari',
    model: '488 GTB',
    year: 2024,
    trim: 'GTB',
    displayName: '2024 Ferrari 488 GTB',
    category: CarCategory.SUPERCAR,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.RWD,
    seats: 2,
    doors: 2,
    engineSize: 3.9,
    engineType: 'V8 Twin-Turbo',
    horsePower: 670,
    torque: 760,
    topSpeed: 330,
    acceleration: 3.0,
    fuelConsumption: 11.4,
    features: [
      'F1-Trac Traction Control',
      'E-Diff3 Electronic Differential',
      'Ferrari Dynamic Enhancer',
      'LED Headlights',
      'Premium Leather Interior',
      'Carbon Fiber Trim',
      'Racing Seats',
      'Launch Control'
    ],
    basePricePerDay: 2999,
    depositAmount: 0,
    primaryImageUrl: '/Ferrari 488 - black.jpg'
  },
  {
    make: 'Ferrari',
    model: '488 GTB',
    year: 2024,
    trim: 'GTB',
    displayName: '2024 Ferrari 488 GTB Red',
    category: CarCategory.SUPERCAR,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.RWD,
    seats: 2,
    doors: 2,
    engineSize: 3.9,
    engineType: 'V8 Twin-Turbo',
    horsePower: 670,
    torque: 760,
    topSpeed: 330,
    acceleration: 3.0,
    fuelConsumption: 11.4,
    features: [
      'F1-Trac Traction Control',
      'E-Diff3 Electronic Differential',
      'Ferrari Dynamic Enhancer',
      'LED Headlights',
      'Premium Leather Interior',
      'Carbon Fiber Trim',
      'Racing Seats',
      'Launch Control'
    ],
    basePricePerDay: 2999,
    depositAmount: 0,
    primaryImageUrl: '/Ferrari 488 - red.jpg'
  },
  {
    make: 'Mercedes-Benz',
    model: 'G63 AMG',
    year: 2024,
    trim: 'AMG G63',
    displayName: '2024 Mercedes-Benz G63 AMG',
    category: CarCategory.SUV,
    bodyType: BodyType.SUV,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 5,
    doors: 4,
    engineSize: 4.0,
    engineType: 'V8 Twin-Turbo',
    horsePower: 577,
    torque: 627,
    topSpeed: 220,
    acceleration: 4.5,
    fuelConsumption: 13.1,
    features: [
      'AMG Performance Exhaust',
      'AMG Ride Control Suspension',
      'Burmester Premium Sound',
      'AMG Night Package',
      'Panoramic Sunroof',
      'Digital Cockpit',
      'Ambient Lighting',
      'Premium Leather Interior'
    ],
    basePricePerDay: 1999,
    depositAmount: 0,
    primaryImageUrl: '/G63-white.jpg'
  },
  {
    make: 'Lamborghini',
    model: 'Urus Performante',
    year: 2024,
    trim: 'Performante',
    displayName: '2024 Lamborghini Urus Performante',
    category: CarCategory.SUV,
    bodyType: BodyType.SUV,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 5,
    doors: 4,
    engineSize: 4.0,
    engineType: 'V8 Twin-Turbo',
    horsePower: 666,
    torque: 627,
    topSpeed: 306,
    acceleration: 3.3,
    fuelConsumption: 12.7,
    features: [
      'Performante Aerodynamics',
      'Adaptive Air Suspension',
      'Carbon Ceramic Brakes',
      'Lamborghini Infotainment',
      'Premium Leather Interior',
      'Carbon Fiber Trim',
      'Sport Exhaust System',
      'Launch Control'
    ],
    basePricePerDay: 2499,
    depositAmount: 0,
    primaryImageUrl: '/Lamborghini Urus Performante Blue.jpg'
  },
  {
    make: 'McLaren',
    model: '720S',
    year: 2024,
    trim: '720S',
    displayName: '2024 McLaren 720S',
    category: CarCategory.SUPERCAR,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.RWD,
    seats: 2,
    doors: 2,
    engineSize: 4.0,
    engineType: 'V8 Twin-Turbo',
    horsePower: 710,
    torque: 568,
    topSpeed: 341,
    acceleration: 2.9,
    fuelConsumption: 10.7,
    features: [
      'Active Aerodynamics',
      'ProActive Chassis Control',
      'McLaren Track Telemetry',
      'Bowers & Wilkins Audio',
      'Carbon Fiber Monocage',
      'Dihedral Doors',
      'Launch Control',
      'Track Mode'
    ],
    basePricePerDay: 3499,
    depositAmount: 0,
    primaryImageUrl: '/McLaren Blue.jpg'
  },
  {
    make: 'Lamborghini',
    model: 'Urus',
    year: 2024,
    trim: 'Urus',
    displayName: '2024 Lamborghini Urus Hulk Green',
    category: CarCategory.SUV,
    bodyType: BodyType.SUV,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 5,
    doors: 4,
    engineSize: 4.0,
    engineType: 'V8 Twin-Turbo',
    horsePower: 641,
    torque: 627,
    topSpeed: 305,
    acceleration: 3.6,
    fuelConsumption: 12.7,
    features: [
      'Adaptive Air Suspension',
      'Carbon Ceramic Brakes',
      'Lamborghini Infotainment',
      'Premium Leather Interior',
      'Carbon Fiber Trim',
      'Sport Exhaust System',
      'Launch Control',
      'Anima Selector'
    ],
    basePricePerDay: 2299,
    depositAmount: 0,
    primaryImageUrl: '/Urus Hulk Green.jpg'
  }
]

// Add-ons data
const ADD_ONS = [
  {
    slug: 'premium-insurance',
    name: 'Premium Insurance Package',
    description: 'Comprehensive coverage with zero deductible',
    category: AddOnCategory.INSURANCE,
    priceType: PriceType.PER_DAY,
    price: 150,
    currency: 'AED',
    icon: 'shield'
  },
  {
    slug: 'extra-mileage-pack',
    name: 'Extra Mileage Pack',
    description: 'Additional 200km per day',
    category: AddOnCategory.SERVICE,
    priceType: PriceType.PER_DAY,
    price: 100,
    currency: 'AED',
    icon: 'road'
  },
  {
    slug: 'child-seat',
    name: 'Child Safety Seat',
    description: 'Premium child seat suitable for 0-4 years',
    category: AddOnCategory.EQUIPMENT,
    priceType: PriceType.PER_BOOKING,
    price: 50,
    currency: 'AED',
    icon: 'baby',
    maxQuantity: 2
  },
  {
    slug: 'personal-chauffeur',
    name: 'Personal Chauffeur',
    description: 'Professional driver for your journey',
    category: AddOnCategory.SERVICE,
    priceType: PriceType.PER_DAY,
    price: 500,
    currency: 'AED',
    icon: 'user-tie',
    requiresApproval: true
  },
  {
    slug: 'photographer-package',
    name: 'Professional Photoshoot',
    description: '2-hour photoshoot with your rental car',
    category: AddOnCategory.EXPERIENCE,
    priceType: PriceType.PER_BOOKING,
    price: 800,
    currency: 'AED',
    icon: 'camera',
    requiresApproval: true
  },
  {
    slug: 'champagne-flowers',
    name: 'Champagne & Flowers Welcome',
    description: 'Dom Pérignon and fresh flower arrangement',
    category: AddOnCategory.EXPERIENCE,
    priceType: PriceType.PER_BOOKING,
    price: 350,
    currency: 'AED',
    icon: 'champagne'
  }
]

// Coupons data
const COUPONS = [
  {
    code: 'WELCOME10',
    description: 'First-time customer discount',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    minimumAmount: 1000
  },
  {
    code: 'SUMMER2024',
    description: 'Summer special offer',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 15,
    validFrom: new Date('2024-06-01'),
    validUntil: new Date('2024-08-31'),
    minimumAmount: 2000
  },
  {
    code: 'VIP500',
    description: 'VIP customer flat discount',
    discountType: DiscountType.FIXED_AMOUNT,
    discountValue: 500,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    minimumAmount: 3000,
    usageLimit: 100
  }
]

// Testimonials data
const TESTIMONIALS = [
  {
    authorName: 'Mohammed Al-Rashid',
    authorTitle: 'Business Executive',
    content: 'Exceptional service from start to finish. The Ferrari 488 GTB was immaculate, and the delivery to my hotel in Chicago was seamless. Midwest Luxury Rentals sets the standard for luxury car rentals in the UAE.',
    rating: 5,
    carModel: 'Ferrari 488 GTB',
    isPublished: true,
    publishedAt: new Date()
  },
  {
    authorName: 'Fatima Al-Mansouri',
    authorTitle: 'Fashion Designer',
    content: 'The McLaren 720S was perfect for my photoshoot in Chicago. The team at Midwest Luxury Rentals understood exactly what I needed and went above and beyond to accommodate my schedule.',
    rating: 5,
    carModel: 'McLaren 720S',
    isPublished: true,
    publishedAt: new Date()
  },
  {
    authorName: 'Ahmed Al-Zaabi',
    authorTitle: 'Private Investor',
    content: 'I\'ve rented luxury cars worldwide, but Midwest Luxury Rentals\' attention to detail is unmatched. The Mercedes G63 AMG was pristine, and their concierge service made everything effortless.',
    rating: 5,
    carModel: 'Mercedes G63 AMG',
    isPublished: true,
    publishedAt: new Date()
  },
  {
    authorName: 'Layla Hassan',
    authorTitle: 'Art Gallery Director',
    content: 'Driving the Audi RS3 through Chicago was a dream come true. Midwest Luxury Rentals\' team provided excellent service and made the entire experience memorable.',
    rating: 5,
    carModel: 'Lamborghini Urus',
    isPublished: true,
    publishedAt: new Date()
  },
  {
    authorName: 'Khalid Al-Falasi',
    authorTitle: 'Film Producer',
    content: 'For my anniversary, I rented the Lamborghini Urus Performante from Midwest Luxury Rentals. The car was stunning with its amazing performance, and the premium experience made it unforgettable. Truly five-star service in Chicago.',
    rating: 5,
    carModel: 'Lamborghini Urus Performante',
    isPublished: true,
    publishedAt: new Date()
  },
  {
    authorName: 'Omar Abdullah',
    authorTitle: 'Professional Driver',
    content: 'The Ferrari 488 GTB is an absolute masterpiece! Midwest Luxury Rentals delivered it in perfect condition. The raw performance exceeded my expectations. A true driver\'s car!',
    rating: 5,
    carModel: 'Ferrari 488 GTB',
    isPublished: true,
    publishedAt: new Date()
  }
]

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.notification.deleteMany()
  await prisma.damageReport.deleteMany()
  await prisma.contract.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.bookingAddOn.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.maintenance.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.seasonalRate.deleteMany()
  await prisma.priceRule.deleteMany()
  await prisma.carImage.deleteMany()
  await prisma.car.deleteMany()
  await prisma.addOn.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.paymentMethod.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  console.log('👤 Creating admin user...')
  await prisma.user.create({
    data: {
      email: 'flyrentalsca@gmail.com',
      name: 'Admin User',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      isVerified: true,
      emailVerified: new Date(),
      acceptedTermsAt: new Date()
    }
  })

  // Create test customer
  console.log('👤 Creating test customer...')
  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      name: 'Ahmed Al-Mansouri',
      phone: '+971585046440',
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
      isVerified: true,
      emailVerified: new Date(),
      acceptedTermsAt: new Date(),
      dateOfBirth: new Date('1990-01-01'),
      licenseNumber: 'DL123456789',
      licenseExpiry: new Date('2028-01-01'),
      licenseVerified: true,
      addressLine1: 'Chicago Marina',
      city: 'Chicago',
      postalCode: '00000',
      country: 'United Arab Emirates'
    }
  })

  // Create cars with images and price rules
  console.log('🚗 Creating luxury cars...')
  const cars = []
  for (const carData of LUXURY_CARS) {
    const { basePricePerDay, depositAmount, primaryImageUrl, ...carInfo } = carData
    
    const car = await prisma.car.create({
      data: {
        ...carInfo,
        slug: `${carInfo.make}-${carInfo.model}-${carInfo.year}`.toLowerCase().replace(/\s+/g, '-'),
        description: carInfo.displayName === '2024 Ferrari 488 GTB' 
          ? 'Experience the pinnacle of Italian automotive excellence with the Ferrari 488 GTB. This mid-engine supercar features a 3.9-liter V8 twin-turbo engine producing 670 horsepower, accelerating from 0-100 km/h in just 3.0 seconds. With its F1-derived aerodynamics, advanced traction control systems, and iconic Ferrari styling, the 488 GTB represents the perfect fusion of performance and artistry. Available at 2,999 AED per day.'
          : carInfo.displayName === '2024 Ferrari 488 GTB Red'
          ? 'Experience the pinnacle of Italian automotive excellence with the Ferrari 488 GTB in iconic Rosso Corsa. This mid-engine supercar features a 3.9-liter V8 twin-turbo engine producing 670 horsepower, accelerating from 0-100 km/h in just 3.0 seconds. With its F1-derived aerodynamics, advanced traction control systems, and iconic Ferrari styling in the classic red finish, the 488 GTB represents the perfect fusion of performance and artistry. Available at 2,999 AED per day.'
          : carInfo.displayName === '2024 Mercedes-Benz G63 AMG'
          ? 'Experience the ultimate luxury SUV with the Mercedes-Benz G63 AMG. This iconic off-road legend features a 4.0-liter V8 twin-turbo engine producing 577 horsepower, accelerating from 0-100 km/h in just 4.5 seconds. With its legendary three-locking differentials, adaptive air suspension, and opulent interior featuring Burmester premium sound, the G63 AMG combines uncompromising off-road capability with supreme luxury. Available at 1,999 AED per day.'
          : carInfo.displayName === '2024 Lamborghini Urus Performante'
          ? 'Experience the ultimate super SUV with the Lamborghini Urus Performante. This high-performance SUV features a 4.0-liter V8 twin-turbo engine producing 666 horsepower, accelerating from 0-100 km/h in just 3.3 seconds. With its Performante aerodynamics, adaptive air suspension, and carbon ceramic brakes, the Urus Performante delivers supercar performance in an SUV package. Available at 2,499 AED per day.'
          : carInfo.displayName === '2024 McLaren 720S'
          ? 'Experience the pinnacle of British supercar engineering with the McLaren 720S. This mid-engine masterpiece features a 4.0-liter V8 twin-turbo engine producing 710 horsepower, accelerating from 0-100 km/h in just 2.9 seconds. With its active aerodynamics, ProActive chassis control, and carbon fiber monocage, the 720S delivers Formula 1-inspired performance on the road. Available at 3,499 AED per day.'
          : 'Experience the ultimate super SUV with the Lamborghini Urus in striking Hulk Green. This high-performance SUV features a 4.0-liter V8 twin-turbo engine producing 641 horsepower, accelerating from 0-100 km/h in just 3.6 seconds. With its adaptive air suspension, carbon ceramic brakes, and distinctive green finish, the Urus delivers supercar performance in an SUV package. Available at 2,299 AED per day.',
        primaryImageUrl: primaryImageUrl,
        featured: Math.random() > 0.5,
        featuredOrder: Math.floor(Math.random() * 10),
        images: {
          create: [{
            url: primaryImageUrl,
            alt: `${carInfo.displayName} - Primary Image`,
            order: 0,
            isGallery: true
          }]
        },
        priceRules: {
          create: {
            basePricePerDay,
            currency: 'AED',
            depositAmount,
            weekendMultiplier: 1.0,
            weeklyDiscount: 0.0,
            monthlyDiscount: 0.0,
            minimumDays: 1,
            maximumDays: 30,
            includedKmPerDay: 250,
            extraKmPrice: 3
          }
        }
      },
      include: {
        priceRules: true,
        images: true
      }
    })
    cars.push(car)
  }

  // Create seasonal rates for summer
  console.log('📅 Creating seasonal rates...')
  for (const car of cars) {
    if (car.priceRules[0]) {
      await prisma.seasonalRate.create({
        data: {
          priceRuleId: car.priceRules[0].id,
          name: 'Summer Peak Season',
          startDate: new Date('2024-07-01'),
          endDate: new Date('2024-08-31'),
          multiplier: 1.25
        }
      })
    }
  }

  // Create add-ons
  console.log('🎁 Creating add-ons...')
  for (const addOnData of ADD_ONS) {
    await prisma.addOn.create({
      data: addOnData
    })
  }

  // Create coupons
  console.log('🎟️ Creating coupons...')
  for (const couponData of COUPONS) {
    await prisma.coupon.create({
      data: couponData
    })
  }

  // Create testimonials
  console.log('💬 Creating testimonials...')
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    await prisma.testimonial.create({
      data: {
        ...TESTIMONIALS[i],
        order: i
      }
    })
  }

  // Create sample availability for the next 90 days
  console.log('📅 Creating availability data...')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (const car of cars) {
    const availabilityData = []
    for (let i = 0; i < 90; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      
      // Make some random dates unavailable (10% chance)
      const isAvailable = Math.random() > 0.1
      
      availabilityData.push({
        carId: car.id,
        date,
        isAvailable,
        reason: isAvailable ? null : faker.helpers.arrayElement(['maintenance', 'booked', 'blocked'])
      })
    }
    
    await prisma.availability.createMany({
      data: availabilityData
    })
  }

  // Create a sample booking
  console.log('📝 Creating sample booking...')
  const sampleCar = cars[0]
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() + 7)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 3)

  const booking = await prisma.booking.create({
    data: {
      bookingNumber: `VR${Date.now()}`,
      userId: customerUser.id,
      carId: sampleCar.id,
      startDate,
      endDate,
      pickupType: 'SHOWROOM',
      returnType: 'SHOWROOM',
      basePriceTotal: 2097, // 3 days * 699 AED
      feesTotal: 50,
      taxTotal: 0,
      totalAmount: 2147,
      currency: 'AED',
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      includedKm: 600, // 3 days * 200km
      confirmedAt: new Date(),
      addOns: {
        create: [
          {
            addOnId: (await prisma.addOn.findFirst({ where: { slug: 'premium-insurance' } }))!.id,
            quantity: 3,
            unitPrice: 150,
            totalPrice: 450
          }
        ]
      }
    }
  })

  // Create payment for the booking
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      stripePaymentIntentId: `pi_${faker.string.alphanumeric(24)}`,
      amount: booking.totalAmount,
      currency: 'AED',
      type: 'RENTAL_FEE',
      method: 'CARD',
      status: 'SUCCEEDED',
      processedAt: new Date()
    }
  })

  console.log('✅ Database seed completed successfully!')
  console.log(`
    Created:
    - 2 users (flyrentalsca@gmail.com, customer@example.com)
    - ${cars.length} luxury cars with images and pricing (Huracán: 999 CAD/day, Urus: 1199 CAD/day, SL63: 899 CAD/day, GT3 RS: 949 CAD/day)
    - ${ADD_ONS.length} add-ons
    - ${COUPONS.length} coupons
    - ${TESTIMONIALS.length} testimonials
    - 1 sample booking with payment
    - 90 days of availability data
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
