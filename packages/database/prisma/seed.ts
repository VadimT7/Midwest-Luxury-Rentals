import { PrismaClient, Role, CarCategory, BodyType, TransmissionType, FuelType, DrivetrainType, AddOnCategory, PriceType, UserStatus, DiscountType } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

// Luxury car data for Falcon Flair Car Rental fleet
const LUXURY_CARS = [
  {
    make: 'BMW',
    model: 'M440',
    year: 2025,
    trim: 'M440i xDrive',
    displayName: '2025 BMW M440 Coupé',
    category: CarCategory.SPORTS,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 4,
    doors: 2,
    engineSize: 3.0,
    engineType: 'Inline-6 Turbo',
    horsePower: 374,
    torque: 500,
    topSpeed: 250,
    acceleration: 4.5,
    fuelConsumption: 8.5,
    features: [
      'M Sport Suspension',
      'Adaptive LED Headlights',
      'Harman Kardon Audio',
      'M Sport Differential',
      'Driving Assistant Professional',
      'Head-Up Display',
      'Wireless Charging',
      'Premium Leather Interior'
    ],
    basePricePerDay: 699,
    depositAmount: 0,
    primaryImageUrl: '/BMWM440_coupe.jpg'
  },
  {
    make: 'Mercedes-Benz',
    model: 'CLE 53 AMG',
    year: 2024,
    trim: 'AMG 53 4MATIC+',
    displayName: 'Mercedes Benz CLE 53 AMG',
    category: CarCategory.LUXURY,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 4,
    doors: 2,
    engineSize: 3.0,
    engineType: 'Inline-6 Turbo + EQ Boost',
    horsePower: 443,
    torque: 560,
    topSpeed: 250,
    acceleration: 4.0,
    fuelConsumption: 9.0,
    features: [
      'AMG Performance Exhaust',
      'AMG Ride Control Suspension',
      'Burmester Surround Sound',
      'AMG Track Pace',
      'MBUX Augmented Reality',
      'AMG Night Package',
      'Panoramic Sunroof',
      'Carbon Fiber Trim'
    ],
    basePricePerDay: 699,
    depositAmount: 0,
    primaryImageUrl: '/CLE53_1.jpeg'
  },
  {
    make: 'Mercedes-Benz',
    model: 'C43 AMG',
    year: 2024,
    trim: 'AMG C43 4MATIC',
    displayName: 'Mercedes Benz C43 AMG',
    category: CarCategory.LUXURY,
    bodyType: BodyType.SEDAN,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 5,
    doors: 4,
    engineSize: 2.0,
    engineType: 'Inline-4 Turbo',
    horsePower: 408,
    torque: 500,
    topSpeed: 250,
    acceleration: 4.6,
    fuelConsumption: 8.8,
    features: [
      'AMG Sport Suspension',
      'AMG Performance Steering Wheel',
      'Burmester Sound System',
      'AMG Night Package',
      'Panoramic Sunroof',
      'Digital Cockpit',
      'Ambient Lighting',
      'Sport Seats'
    ],
    basePricePerDay: 499,
    depositAmount: 0,
    primaryImageUrl: '/C43AMG_1.jpg'
  },
  {
    make: 'Rox',
    model: '01',
    year: 2025,
    trim: 'VIP',
    displayName: '2025 Rox 01 VIP',
    category: CarCategory.SUV,
    bodyType: BodyType.SUV,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.HYBRID,
    drivetrain: DrivetrainType.AWD,
    seats: 5,
    doors: 4,
    engineSize: 2.0,
    engineType: 'Plug-in Hybrid',
    horsePower: 320,
    torque: 480,
    topSpeed: 200,
    acceleration: 6.5,
    fuelConsumption: 2.5,
    features: [
      '1300 km Range',
      'Plug-in Hybrid System',
      'Premium Interior',
      'Advanced Driver Assistance',
      'Panoramic Glass Roof',
      'Premium Sound System',
      'Wireless Charging',
      'Luxury Seating'
    ],
    basePricePerDay: 699,
    depositAmount: 0,
    primaryImageUrl: '/placeholder-car.jpg'
  },
  {
    make: 'Audi',
    model: 'RS3',
    year: 2024,
    trim: 'RS3 Sportback',
    displayName: 'Audi RS3 Hatchback Daytona Grey',
    category: CarCategory.SPORTS,
    bodyType: BodyType.HATCHBACK,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 5,
    doors: 4,
    engineSize: 2.5,
    engineType: 'Inline-5 Turbo',
    horsePower: 400,
    torque: 500,
    topSpeed: 290,
    acceleration: 3.8,
    fuelConsumption: 9.8,
    features: [
      'Quattro AWD',
      'RS Sport Suspension Plus',
      'RS Sport Exhaust',
      'Bang & Olufsen Premium Sound',
      'Matrix LED Headlights',
      'Virtual Cockpit Plus',
      'RS Design Package',
      'Carbon Ceramic Brakes'
    ],
    basePricePerDay: 699,
    depositAmount: 0,
    primaryImageUrl: '/RS3-Hatchback-Daytona.jpg'
  },
  {
    make: 'Audi',
    model: 'RS3',
    year: 2024,
    trim: 'RS3 Sportback',
    displayName: 'Audi RS3 Hatchback Black',
    category: CarCategory.SPORTS,
    bodyType: BodyType.HATCHBACK,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 5,
    doors: 4,
    engineSize: 2.5,
    engineType: 'Inline-5 Turbo',
    horsePower: 400,
    torque: 500,
    topSpeed: 290,
    acceleration: 3.8,
    fuelConsumption: 9.8,
    features: [
      'Quattro AWD',
      'RS Sport Suspension Plus',
      'RS Sport Exhaust',
      'Bang & Olufsen Premium Sound',
      'Matrix LED Headlights',
      'Virtual Cockpit Plus',
      'RS Design Package',
      'Carbon Ceramic Brakes'
    ],
    basePricePerDay: 699,
    depositAmount: 0,
    primaryImageUrl: '/RS3HatchbackBlack-NotDaytona.jpg'
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
    content: 'Exceptional service from start to finish. The BMW M440 was immaculate, and the delivery to my hotel in Dubai was seamless. Falcon Flair Car Rental sets the standard for luxury car rentals in the UAE.',
    rating: 5,
    carModel: 'BMW M440',
    isPublished: true,
    publishedAt: new Date()
  },
  {
    authorName: 'Fatima Al-Mansouri',
    authorTitle: 'Fashion Designer',
    content: 'The Mercedes CLE 53 AMG was perfect for my photoshoot in Dubai. The team at Falcon Flair Car Rental understood exactly what I needed and went above and beyond to accommodate my schedule.',
    rating: 5,
    carModel: 'Mercedes CLE 53 AMG',
    isPublished: true,
    publishedAt: new Date()
  },
  {
    authorName: 'Ahmed Al-Zaabi',
    authorTitle: 'Private Investor',
    content: 'I\'ve rented luxury cars worldwide, but Falcon Flair Car Rental\'s attention to detail is unmatched. The Mercedes C43 AMG was pristine, and their concierge service made everything effortless.',
    rating: 5,
    carModel: 'Mercedes C43 AMG',
    isPublished: true,
    publishedAt: new Date()
  },
  {
    authorName: 'Layla Hassan',
    authorTitle: 'Art Gallery Director',
    content: 'Driving the Audi RS3 through Dubai was a dream come true. Falcon Flair Car Rental\'s team provided excellent service and made the entire experience memorable.',
    rating: 5,
    carModel: 'Audi RS3',
    isPublished: true,
    publishedAt: new Date()
  },
  {
    authorName: 'Khalid Al-Falasi',
    authorTitle: 'Film Producer',
    content: 'For my anniversary, I rented the ROX 01 VIP from Falcon Flair Car Rental. The car was stunning with its amazing range, and the premium experience made it unforgettable. Truly five-star service in Dubai.',
    rating: 5,
    carModel: 'ROX 01 VIP',
    isPublished: true,
    publishedAt: new Date()
  },
  {
    authorName: 'Omar Abdullah',
    authorTitle: 'Professional Driver',
    content: 'The Audi RS3 Daytona is an absolute masterpiece! Falcon Flair Car Rental delivered it in perfect condition. The raw performance exceeded my expectations. A true driver\'s car!',
    rating: 5,
    carModel: 'Audi RS3 Daytona',
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
      addressLine1: 'Dubai Marina',
      city: 'Dubai',
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
        description: carInfo.displayName === '2025 BMW M440 Coupé' 
          ? 'Experience the perfect blend of dynamic performance and everyday luxury with the BMW M440 Coupé. This sophisticated sports coupe features a powerful inline-6 turbocharged engine delivering 374 horsepower, propelling you from 0-100 km/h in just 4.5 seconds. With its aggressive M Sport styling, premium interior craftsmanship, and cutting-edge technology, the M440 represents the pinnacle of modern BMW engineering. Available now at our exclusive summer rates of 699 AED per day.'
          : carInfo.displayName === 'Mercedes Benz CLE 53 AMG'
          ? 'The Mercedes-Benz CLE 53 AMG redefines the grand tourer with its seamless fusion of luxury and performance. Powered by a 3.0-liter inline-six engine enhanced with EQ Boost technology, it delivers an exhilarating 443 horsepower and reaches 100 km/h in just 4.0 seconds. The CLE 53 AMG showcases Mercedes\' commitment to excellence with its refined AMG performance exhaust, adaptive suspension, and meticulously crafted interior featuring Burmester surround sound. Reserve this masterpiece today at 699 AED per day.'
          : carInfo.displayName === 'Mercedes Benz C43 AMG'
          ? 'Discover the Mercedes-Benz C43 AMG, where sports sedan performance meets executive comfort. This refined performance machine features a turbocharged 2.0-liter engine producing 408 horsepower, achieving 0-100 km/h in an impressive 4.6 seconds. The C43 AMG embodies the perfect daily driver with its AMG sport suspension, premium Burmester sound system, and sophisticated digital cockpit. Experience German engineering excellence at its finest, available from 499 AED per day.'
          : carInfo.displayName === '2025 Rox 01 VIP'
          ? 'Introducing the 2025 Rox 01 VIP, the future of sustainable luxury mobility. This groundbreaking plug-in hybrid SUV offers an unprecedented 1,300 km range, combining eco-conscious engineering with uncompromising premium comfort. The Rox 01 VIP features advanced driver assistance systems, a meticulously appointed interior with luxury seating, and a panoramic glass roof that transforms every journey. Perfect for the discerning driver who values both performance and environmental responsibility. Available at 699 AED per day with no deposit required.'
          : carInfo.displayName === 'Audi RS3 Hatchback Daytona Grey'
          ? 'The Audi RS3 Sportback in exclusive Daytona Grey represents the ultimate hot hatchback experience. Powered by Audi\'s legendary 2.5-liter turbocharged five-cylinder engine producing 400 horsepower, it accelerates from 0-100 km/h in a breathtaking 3.8 seconds. The RS3 combines everyday practicality with supercar performance, featuring Quattro all-wheel drive, RS Sport Suspension Plus, and a distinctive five-cylinder soundtrack enhanced by the RS Sport Exhaust. Finished in the striking Daytona Grey, this compact powerhouse is available at 699 AED per day.'
          : 'Experience the sophisticated menace of the Audi RS3 Sportback in timeless Black. This performance hatchback masterpiece houses a turbocharged 2.5-liter five-cylinder engine delivering 400 horsepower and an iconic engine note. With a 0-100 km/h time of just 3.8 seconds and Quattro all-wheel drive, the RS3 offers uncompromising performance wrapped in an elegant black exterior. The interior features Bang & Olufsen premium sound, Matrix LED headlights, and RS-specific sport seats. Perfect for those who demand both practicality and pulse-racing performance at 699 AED per day.',
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
