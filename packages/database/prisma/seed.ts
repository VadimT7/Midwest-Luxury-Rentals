import { PrismaClient, Role, CarCategory, BodyType, TransmissionType, FuelType, DrivetrainType, AddOnCategory, PriceType, UserStatus, DiscountType } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// Luxury car data based on Midwest Luxury Rentals fleet
const LUXURY_CARS = [
  {
    make: 'Ferrari',
    model: 'SF90 Spider',
    year: 2024,
    trim: 'Spider',
    displayName: 'Ferrari SF90 Spider',
    category: CarCategory.SUPERCAR,
    bodyType: BodyType.CONVERTIBLE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.HYBRID,
    drivetrain: DrivetrainType.AWD,
    seats: 2,
    doors: 2,
    engineSize: 4.0,
    engineType: 'Twin-Turbo V8 + Electric',
    horsePower: 986,
    torque: 590,
    topSpeed: 211,
    acceleration: 2.5,
    fuelConsumption: 10.5,
    features: [
      'Retractable Hardtop',
      'Hybrid Powertrain',
      'eManettino Controller',
      'Carbon Fiber Package',
      'Apple CarPlay',
      'Racing Seats',
      'Launch Control',
      'Active Aerodynamics'
    ],
    basePricePerDay: 1600,
    depositAmount: 15000,
    primaryImageUrl: '/Cars/image0.jpeg',
    images: ['/Cars/image0.jpeg', '/Cars/image2.jpeg'],
    featured: true,
    featuredOrder: 1
  },
  {
    make: 'Ferrari',
    model: '488 GTB',
    year: 2024,
    trim: 'GTB Tuned',
    displayName: 'Ferrari 488 GTB - Tuned',
    category: CarCategory.SUPERCAR,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.RWD,
    seats: 2,
    doors: 2,
    engineSize: 3.9,
    engineType: 'Twin-Turbo V8',
    horsePower: 720,
    torque: 590,
    topSpeed: 211,
    acceleration: 2.8,
    fuelConsumption: 11.4,
    features: [
      'Performance Tune',
      'F1-DCT Transmission',
      'Side Slip Control',
      'Carbon Fiber Interior',
      'Racing Exhaust',
      'Launch Control',
      'Track Mode',
      'Premium Sound System'
    ],
    basePricePerDay: 999,
    depositAmount: 10000,
    primaryImageUrl: '/Cars/Ferrari 488 - black.jpg',
    images: ['/Cars/Ferrari 488 - black.jpg', '/Cars/Ferrari 488 - red.jpg', '/Cars/image3.jpeg'],
    featured: true,
    featuredOrder: 2
  },
  {
    make: 'Lamborghini',
    model: 'Huracan Evo',
    year: 2024,
    trim: 'Evo Tuned',
    displayName: 'Lamborghini Huracan Evo - Tuned',
    category: CarCategory.SUPERCAR,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 2,
    doors: 2,
    engineSize: 5.2,
    engineType: 'V10',
    horsePower: 670,
    torque: 442,
    topSpeed: 202,
    acceleration: 2.7,
    fuelConsumption: 13.7,
    features: [
      'Performance Tune',
      'ANIMA Drive Selector',
      'Carbon Ceramic Brakes',
      'Lamborghini Infotainment',
      'Sport Exhaust',
      'Alcantara Interior',
      'Launch Control',
      'Magnetic Ride'
    ],
    basePricePerDay: 999,
    depositAmount: 10000,
    primaryImageUrl: '/Cars/image22.jpeg',
    images: ['/Cars/image22.jpeg', '/Cars/image23.jpeg', '/Cars/image24.jpeg'],
    featured: true,
    featuredOrder: 3
  },
  {
    make: 'Lamborghini',
    model: 'Huracan Evo Spyder',
    year: 2024,
    trim: 'Evo Spyder',
    displayName: 'Lamborghini Huracan Evo Spyder',
    category: CarCategory.SUPERCAR,
    bodyType: BodyType.CONVERTIBLE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 2,
    doors: 2,
    engineSize: 5.2,
    engineType: 'V10',
    horsePower: 640,
    torque: 442,
    topSpeed: 201,
    acceleration: 3.1,
    fuelConsumption: 13.7,
    features: [
      'Retractable Soft Top',
      'ANIMA Drive Selector',
      'Carbon Ceramic Brakes',
      'Premium Sound System',
      'Sport Exhaust',
      'Alcantara Interior',
      'Launch Control',
      'Active Aerodynamics'
    ],
    basePricePerDay: 999,
    depositAmount: 10000,
    primaryImageUrl: '/Cars/image29.jpeg',
    images: ['/Cars/image29.jpeg', '/Cars/image31.jpeg', '/Cars/image32.jpeg'],
    featured: true,
    featuredOrder: 4
  },
  {
    make: 'Lamborghini',
    model: 'Huracan Evo Spyder',
    year: 2024,
    trim: 'Evo Spyder',
    displayName: 'Lamborghini Huracan Evo Spyder #2',
    category: CarCategory.SUPERCAR,
    bodyType: BodyType.CONVERTIBLE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 2,
    doors: 2,
    engineSize: 5.2,
    engineType: 'V10',
    horsePower: 640,
    torque: 442,
    topSpeed: 201,
    acceleration: 3.1,
    fuelConsumption: 13.7,
    features: [
      'Retractable Soft Top',
      'ANIMA Drive Selector',
      'Carbon Ceramic Brakes',
      'Premium Sound System',
      'Sport Exhaust',
      'Alcantara Interior',
      'Launch Control',
      'Active Aerodynamics'
    ],
    basePricePerDay: 999,
    depositAmount: 10000,
    primaryImageUrl: '/Cars/image33.jpeg',
    images: ['/Cars/image33.jpeg', '/Cars/image36.jpeg', '/Cars/image37.jpeg'],
    featured: false,
    featuredOrder: 5
  },
  {
    make: 'Lamborghini',
    model: 'Urus',
    year: 2024,
    trim: 'Base',
    displayName: 'Lamborghini Urus',
    category: CarCategory.SUPERCAR,
    bodyType: BodyType.SUV,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 5,
    doors: 4,
    engineSize: 4.0,
    engineType: 'Twin-Turbo V8',
    horsePower: 657,
    torque: 627,
    topSpeed: 190,
    acceleration: 3.6,
    fuelConsumption: 12.7,
    features: [
      'ANIMA Drive Selector',
      'Active Roll Stabilization',
      'Carbon Ceramic Brakes',
      'Lamborghini Infotainment',
      'Bang & Olufsen Sound',
      'Adaptive Air Suspension',
      'Sport Seats',
      'Panoramic Roof'
    ],
    basePricePerDay: 1049,
    depositAmount: 10000,
    primaryImageUrl: '/Cars/Lamborghini Urus Performante Blue.jpg',
    images: [
      '/Cars/Lamborghini Urus Performante Blue.jpg',
      '/Cars/Urus Hulk Green.jpg',
      '/Cars/Urus Black.png',
      '/Cars/image20.jpeg'
    ],
    featured: true,
    featuredOrder: 6
  },
  {
    make: 'Mercedes-Benz',
    model: 'GLS600 Maybach',
    year: 2024,
    trim: 'Maybach',
    displayName: 'Mercedes-Benz GLS600 Maybach',
    category: CarCategory.LUXURY,
    bodyType: BodyType.SUV,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 7,
    doors: 4,
    engineSize: 4.0,
    engineType: 'Twin-Turbo V8',
    horsePower: 550,
    torque: 538,
    topSpeed: 155,
    acceleration: 4.9,
    fuelConsumption: 12.8,
    features: [
      'Maybach Executive Seats',
      'MBUX Infotainment',
      'Burmester 3D Sound',
      'Air Suspension',
      'Panoramic Sunroof',
      'Ambient Lighting',
      'Massaging Seats',
      'Executive Rear Console'
    ],
    basePricePerDay: 899,
    depositAmount: 8000,
    primaryImageUrl: '/Cars/G63-white.jpg',
    images: ['/Cars/G63-white.jpg'],
    featured: false,
    featuredOrder: 7
  },
  {
    make: 'Mercedes-Benz',
    model: 'S580 Maybach',
    year: 2024,
    trim: 'Maybach',
    displayName: 'Mercedes-Benz S580 Maybach',
    category: CarCategory.LUXURY,
    bodyType: BodyType.SEDAN,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 5,
    doors: 4,
    engineSize: 4.0,
    engineType: 'Twin-Turbo V8',
    horsePower: 496,
    torque: 516,
    topSpeed: 155,
    acceleration: 4.8,
    fuelConsumption: 11.5,
    features: [
      'Maybach Executive Seats',
      'MBUX Hyperscreen',
      'Burmester 4D Sound',
      'Magic Body Control',
      'Panoramic Sunroof',
      'Ambient Lighting',
      'Massaging Seats',
      'Rear Entertainment'
    ],
    basePricePerDay: 899,
    depositAmount: 8000,
    primaryImageUrl: '/Cars/image17.jpeg',
    images: ['/Cars/image17.jpeg', '/Cars/image16.jpeg'],
    featured: false,
    featuredOrder: 8
  },
  {
    make: 'McLaren',
    model: '570S Spider',
    year: 2024,
    trim: 'Spider Tuned',
    displayName: 'McLaren 570S Spider - Tuned',
    category: CarCategory.SUPERCAR,
    bodyType: BodyType.CONVERTIBLE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.RWD,
    seats: 2,
    doors: 2,
    engineSize: 3.8,
    engineType: 'Twin-Turbo V8',
    horsePower: 600,
    torque: 443,
    topSpeed: 204,
    acceleration: 3.1,
    fuelConsumption: 10.7,
    features: [
      'Performance Tune',
      'Retractable Hardtop',
      'ProActive Chassis',
      'McLaren Track Telemetry',
      'Bowers & Wilkins Audio',
      'Dihedral Doors',
      'Launch Control',
      'Carbon Fiber Pack'
    ],
    basePricePerDay: 899,
    depositAmount: 9000,
    primaryImageUrl: '/Cars/McLaren Blue.jpg',
    images: ['/Cars/McLaren Blue.jpg', '/Cars/image38.jpeg', '/Cars/image39.jpeg'],
    featured: true,
    featuredOrder: 9
  },
  {
    make: 'McLaren',
    model: '570S Spider',
    year: 2024,
    trim: 'Spider Tuned',
    displayName: 'McLaren 570S Spider - Tuned #2',
    category: CarCategory.SUPERCAR,
    bodyType: BodyType.CONVERTIBLE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.RWD,
    seats: 2,
    doors: 2,
    engineSize: 3.8,
    engineType: 'Twin-Turbo V8',
    horsePower: 600,
    torque: 443,
    topSpeed: 204,
    acceleration: 3.1,
    fuelConsumption: 10.7,
    features: [
      'Performance Tune',
      'Retractable Hardtop',
      'ProActive Chassis',
      'McLaren Track Telemetry',
      'Bowers & Wilkins Audio',
      'Dihedral Doors',
      'Launch Control',
      'Carbon Fiber Pack'
    ],
    basePricePerDay: 899,
    depositAmount: 9000,
    primaryImageUrl: '/Cars/image40.jpeg',
    images: ['/Cars/image40.jpeg', '/Cars/image41.jpeg'],
    featured: false,
    featuredOrder: 10
  },
  {
    make: 'McLaren',
    model: '720S',
    year: 2024,
    trim: '720S',
    displayName: 'McLaren 720S',
    category: CarCategory.SUPERCAR,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.RWD,
    seats: 2,
    doors: 2,
    engineSize: 4.0,
    engineType: 'Twin-Turbo V8',
    horsePower: 710,
    torque: 568,
    topSpeed: 212,
    acceleration: 2.8,
    fuelConsumption: 10.7,
    features: [
      'ProActive Chassis II',
      'McLaren Airbrake',
      'Carbon Fiber MonoCell',
      'IRIS Touchscreen',
      'Bowers & Wilkins Audio',
      'Dihedral Doors',
      'Launch Control',
      'Variable Drift Control'
    ],
    basePricePerDay: 999,
    depositAmount: 10000,
    primaryImageUrl: '/Cars/image42.jpeg',
    images: ['/Cars/image42.jpeg', '/Cars/image43.jpeg', '/Cars/image44.jpeg'],
    featured: true,
    featuredOrder: 11
  },
  {
    make: 'McLaren',
    model: 'GT',
    year: 2024,
    trim: 'GT 700HP',
    displayName: 'McLaren GT - 700HP',
    category: CarCategory.SUPERCAR,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.RWD,
    seats: 2,
    doors: 2,
    engineSize: 4.0,
    engineType: 'Twin-Turbo V8',
    horsePower: 700,
    torque: 531,
    topSpeed: 203,
    acceleration: 3.2,
    fuelConsumption: 10.7,
    features: [
      'Grand Touring Comfort',
      'ProActive Chassis',
      'Premium Leather Interior',
      'Bowers & Wilkins Audio',
      'Electrochromic Roof',
      'Dihedral Doors',
      'Launch Control',
      'Rear Storage'
    ],
    basePricePerDay: 899,
    depositAmount: 9000,
    primaryImageUrl: '/Cars/image45.jpeg',
    images: ['/Cars/image45.jpeg', '/Cars/image46.jpeg'],
    featured: false,
    featuredOrder: 12
  },
  {
    make: 'Chevrolet',
    model: 'Corvette C8',
    year: 2024,
    trim: 'Tuned/Exhaust',
    displayName: 'Corvette C8 - Tuned/Exhaust',
    category: CarCategory.SPORT,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.RWD,
    seats: 2,
    doors: 2,
    engineSize: 6.2,
    engineType: 'V8',
    horsePower: 495,
    torque: 470,
    topSpeed: 194,
    acceleration: 2.9,
    fuelConsumption: 12.0,
    features: [
      'Performance Exhaust',
      'Mid-Engine Layout',
      'Magnetic Ride Control',
      'Performance Data Recorder',
      'Bose Audio',
      'Z51 Performance Package',
      'Launch Control',
      'Removable Roof Panel'
    ],
    basePricePerDay: 299,
    depositAmount: 3000,
    primaryImageUrl: '/Cars/image18.jpeg',
    images: ['/Cars/image18.jpeg'],
    featured: false,
    featuredOrder: 13
  },
  {
    make: 'Chevrolet',
    model: 'Corvette C8',
    year: 2024,
    trim: 'Tuned/Exhaust',
    displayName: 'Corvette C8 - Tuned/Exhaust #2',
    category: CarCategory.SPORT,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.RWD,
    seats: 2,
    doors: 2,
    engineSize: 6.2,
    engineType: 'V8',
    horsePower: 495,
    torque: 470,
    topSpeed: 194,
    acceleration: 2.9,
    fuelConsumption: 12.0,
    features: [
      'Performance Exhaust',
      'Mid-Engine Layout',
      'Magnetic Ride Control',
      'Performance Data Recorder',
      'Bose Audio',
      'Z51 Performance Package',
      'Launch Control',
      'Removable Roof Panel'
    ],
    basePricePerDay: 299,
    depositAmount: 3000,
    primaryImageUrl: '/placeholder-car.jpg',
    featured: false,
    featuredOrder: 14
  },
  {
    make: 'Chevrolet',
    model: 'Corvette C8',
    year: 2024,
    trim: 'Tuned/Exhaust',
    displayName: 'Corvette C8 - Tuned/Exhaust',
    category: CarCategory.SPORT,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.RWD,
    seats: 2,
    doors: 2,
    engineSize: 6.2,
    engineType: 'V8',
    horsePower: 495,
    torque: 470,
    topSpeed: 194,
    acceleration: 2.9,
    fuelConsumption: 12.0,
    features: [
      'Performance Exhaust',
      'Mid-Engine Layout',
      'Magnetic Ride Control',
      'Performance Data Recorder',
      'Bose Audio',
      'Z51 Performance Package',
      'Launch Control',
      'Removable Roof Panel'
    ],
    basePricePerDay: 299,
    depositAmount: 3000,
    primaryImageUrl: '/placeholder-car.jpg',
    featured: false,
    featuredOrder: 15
  },
  {
    make: 'Chevrolet',
    model: 'Corvette C8',
    year: 2024,
    trim: 'Tuned/Exhaust',
    displayName: 'Corvette C8 - Tuned/Exhaust',
    category: CarCategory.SPORT,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.RWD,
    seats: 2,
    doors: 2,
    engineSize: 6.2,
    engineType: 'V8',
    horsePower: 495,
    torque: 470,
    topSpeed: 194,
    acceleration: 2.9,
    fuelConsumption: 12.0,
    features: [
      'Performance Exhaust',
      'Mid-Engine Layout',
      'Magnetic Ride Control',
      'Performance Data Recorder',
      'Bose Audio',
      'Z51 Performance Package',
      'Launch Control',
      'Removable Roof Panel'
    ],
    basePricePerDay: 299,
    depositAmount: 3000,
    primaryImageUrl: '/placeholder-car.jpg',
    featured: false,
    featuredOrder: 16
  },
  {
    make: 'BMW',
    model: 'M3 Competition',
    year: 2024,
    trim: 'G80 Competition',
    displayName: 'BMW M3 Competition',
    category: CarCategory.SPORT,
    bodyType: BodyType.SEDAN,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 5,
    doors: 4,
    engineSize: 3.0,
    engineType: 'Twin-Turbo I6',
    horsePower: 503,
    torque: 479,
    topSpeed: 180,
    acceleration: 3.4,
    fuelConsumption: 11.1,
    features: [
      'M xDrive AWD',
      'Adaptive M Suspension',
      'M Carbon Bucket Seats',
      'Harman Kardon Audio',
      'M Head-Up Display',
      'Carbon Fiber Trim',
      'Launch Control',
      'M Mode Button'
    ],
    basePricePerDay: 299,
    depositAmount: 3000,
    primaryImageUrl: '/placeholder-car.jpg',
    featured: false,
    featuredOrder: 17
  },
  {
    make: 'BMW',
    model: 'M4 Competition',
    year: 2024,
    trim: 'G82 Competition',
    displayName: 'BMW M4 Competition',
    category: CarCategory.SPORT,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 4,
    doors: 2,
    engineSize: 3.0,
    engineType: 'Twin-Turbo I6',
    horsePower: 503,
    torque: 479,
    topSpeed: 180,
    acceleration: 3.4,
    fuelConsumption: 11.1,
    features: [
      'M xDrive AWD',
      'Adaptive M Suspension',
      'M Carbon Bucket Seats',
      'Harman Kardon Audio',
      'M Head-Up Display',
      'Carbon Fiber Roof',
      'Launch Control',
      'M Mode Button'
    ],
    basePricePerDay: 299,
    depositAmount: 3000,
    primaryImageUrl: '/placeholder-car.jpg',
    featured: false,
    featuredOrder: 18
  },
  {
    make: 'BMW',
    model: 'M4 Competition',
    year: 2024,
    trim: 'G82 Competition',
    displayName: 'BMW M4 Competition',
    category: CarCategory.SPORT,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 4,
    doors: 2,
    engineSize: 3.0,
    engineType: 'Twin-Turbo I6',
    horsePower: 503,
    torque: 479,
    topSpeed: 180,
    acceleration: 3.4,
    fuelConsumption: 11.1,
    features: [
      'M xDrive AWD',
      'Adaptive M Suspension',
      'M Carbon Bucket Seats',
      'Harman Kardon Audio',
      'M Head-Up Display',
      'Carbon Fiber Roof',
      'Launch Control',
      'M Mode Button'
    ],
    basePricePerDay: 299,
    depositAmount: 3000,
    primaryImageUrl: '/placeholder-car.jpg',
    images: [],
    featured: false,
    featuredOrder: 19
  },
  {
    make: 'Porsche',
    model: '911 Turbo S',
    year: 2024,
    trim: 'Turbo S 900HP',
    displayName: 'Porsche 911 Turbo S - 900HP',
    category: CarCategory.SUPERCAR,
    bodyType: BodyType.COUPE,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 4,
    doors: 2,
    engineSize: 3.8,
    engineType: 'Twin-Turbo Flat-6',
    horsePower: 900,
    torque: 664,
    topSpeed: 205,
    acceleration: 2.6,
    fuelConsumption: 12.3,
    features: [
      'Performance Upgrade',
      'Sport Chrono Package',
      'PASM Active Suspension',
      'Rear-Axle Steering',
      'Burmester Audio',
      'Carbon Ceramic Brakes',
      'Launch Control',
      'Sport Exhaust'
    ],
    basePricePerDay: 599,
    depositAmount: 6000,
    primaryImageUrl: '/Cars/Porsche 911 GT3.jpg',
    images: ['/Cars/Porsche 911 GT3.jpg'],
    featured: true,
    featuredOrder: 20
  },
  {
    make: 'Bentley',
    model: 'Bentayga',
    year: 2024,
    trim: 'V8',
    displayName: 'Bentley Bentayga',
    category: CarCategory.LUXURY,
    bodyType: BodyType.SUV,
    transmission: TransmissionType.AUTOMATIC,
    fuelType: FuelType.PETROL,
    drivetrain: DrivetrainType.AWD,
    seats: 5,
    doors: 4,
    engineSize: 4.0,
    engineType: 'Twin-Turbo V8',
    horsePower: 542,
    torque: 568,
    topSpeed: 180,
    acceleration: 4.5,
    fuelConsumption: 13.1,
    features: [
      'Naim for Bentley Audio',
      'Bentley Rotating Display',
      'Adaptive Air Suspension',
      'Massage Seats',
      'Panoramic Sunroof',
      'Rear Entertainment',
      'Night Vision',
      'Diamond Quilted Leather'
    ],
    basePricePerDay: 599,
    depositAmount: 6000,
    primaryImageUrl: '/placeholder-car.jpg',
    images: [],
    featured: false,
    featuredOrder: 21
  }
]

// Add-ons for the rental
const ADD_ONS = [
  {
    name: 'Premium Insurance',
    slug: 'premium-insurance',
    description: 'Comprehensive coverage with zero deductible',
    category: AddOnCategory.INSURANCE,
    priceType: PriceType.PER_DAY,
    price: 150,
    currency: 'USD',
    isActive: true,
    icon: 'Shield'
  },
  {
    name: 'GPS Navigation',
    slug: 'gps-navigation',
    description: 'Premium GPS navigation system',
    category: AddOnCategory.EQUIPMENT,
    priceType: PriceType.PER_DAY,
    price: 20,
    currency: 'USD',
    isActive: true,
    icon: 'Navigation'
  },
  {
    name: 'Child Seat',
    slug: 'child-seat',
    description: 'Safety-certified child seat',
    category: AddOnCategory.EQUIPMENT,
    priceType: PriceType.PER_DAY,
    price: 15,
    currency: 'USD',
    isActive: true,
    icon: 'Baby'
  },
  {
    name: 'Additional Driver',
    slug: 'additional-driver',
    description: 'Add an authorized driver',
    category: AddOnCategory.SERVICE,
    priceType: PriceType.PER_BOOKING,
    price: 100,
    currency: 'USD',
    isActive: true,
    icon: 'UserPlus'
  },
  {
    name: 'Airport Delivery',
    slug: 'airport-delivery',
    description: 'Vehicle delivery to airport',
    category: AddOnCategory.SERVICE,
    priceType: PriceType.PER_BOOKING,
    price: 75,
    currency: 'USD',
    isActive: true,
    icon: 'Plane'
  }
]

// Coupons for discounts
const COUPONS = [
  {
    code: 'WELCOME20',
    description: '20% off your first rental',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 20,
    usageLimit: 1000,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    isActive: true
  },
  {
    code: 'LUXURY50',
    description: '$50 off luxury vehicle rentals',
    discountType: DiscountType.FIXED_AMOUNT,
    discountValue: 50,
    minimumAmount: 1000,
    usageLimit: 500,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    isActive: true
  }
]

// Testimonials
const TESTIMONIALS = [
  {
    authorName: 'Michael Anderson',
    content: 'Exceptional service from start to finish. The Ferrari SF90 Spider was absolutely stunning, and the delivery to my hotel in downtown Chicago was seamless. Midwest Luxury Rentals sets the standard for exotic car rentals.',
    rating: 5,
    carModel: 'Ferrari SF90 Spider',
    isPublished: true
  },
  {
    authorName: 'Jennifer Martinez',
    content: 'The McLaren 720S was perfect for my Chicago business trip. The Midwest Luxury Rentals team understood my needs perfectly and exceeded my expectations with their professional service.',
    rating: 5,
    carModel: 'McLaren 720S',
    isPublished: true
  },
  {
    authorName: 'David Thompson',
    content: "I've rented exotic cars nationwide, but Midwest Luxury Rentals' attention to detail is unmatched. The Lamborghini Urus was pristine, and their concierge service made everything effortless in Chicago.",
    rating: 5,
    carModel: 'Lamborghini Urus',
    isPublished: true
  }
]

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.payment.deleteMany()
  await prisma.bookingAddOn.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.addOn.deleteMany()
  await prisma.seasonalRate.deleteMany()
  await prisma.priceRule.deleteMany()
  await prisma.carImage.deleteMany()
  await prisma.car.deleteMany()
  await prisma.systemSettings.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  console.log('👤 Creating users...')
  const adminUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'admin@midwestluxuryrentals.com',
      name: 'Admin User',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      isVerified: true,
      emailVerified: new Date(),
      acceptedTermsAt: new Date(),
      updatedAt: new Date()
    }
  })

  // Create a customer user
  const customerUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'customer@example.com',
      name: 'John Smith',
      phone: '+1 (312) 555-0123',
      addressLine1: '123 Michigan Avenue',
      city: 'Chicago',
      state: 'IL',
      country: 'United States',
      postalCode: '60601',
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
      isVerified: true,
      emailVerified: new Date(),
      acceptedTermsAt: new Date(),
      updatedAt: new Date()
    }
  })

  // Create cars
  console.log('🚗 Creating luxury cars...')
  const cars = []
  for (const carInfo of LUXURY_CARS) {
    const { basePricePerDay, depositAmount, primaryImageUrl, images, featured, featuredOrder } = carInfo
    
    // Create CarImage records for all images
    const carImages = []
    
    // Add primary image first (always include it)
    if (primaryImageUrl && primaryImageUrl !== '/placeholder-car.jpg') {
      carImages.push({
        id: randomUUID(),
        url: primaryImageUrl,
        alt: `${carInfo.displayName} - Primary Image`,
        order: 0,
        isGallery: true
      })
    }
    
    // Add additional images if they exist
    const imageArray = (images as string[]) || []
    if (imageArray.length > 0) {
      imageArray.forEach((imageUrl, index) => {
        // Skip if it's the same as primary image or placeholder
        if (imageUrl !== primaryImageUrl && imageUrl !== '/placeholder-car.jpg') {
          carImages.push({
            id: randomUUID(),
            url: imageUrl,
            alt: `${carInfo.displayName} - Image ${index + 2}`,
            order: index + 1,
            isGallery: true
          })
        }
      })
    }
    
    // If no images at all, create a placeholder
    if (carImages.length === 0) {
      carImages.push({
        id: randomUUID(),
        url: '/placeholder-car.jpg',
        alt: `${carInfo.displayName} - Image`,
        order: 0,
        isGallery: true
      })
    }
    
    // Create the car data object
    const carCreateData: any = {
      id: randomUUID(),
      make: carInfo.make,
      model: carInfo.model,
      year: carInfo.year,
      trim: carInfo.trim,
      displayName: carInfo.displayName,
      category: carInfo.category,
      bodyType: carInfo.bodyType,
      transmission: carInfo.transmission,
      fuelType: carInfo.fuelType,
      drivetrain: carInfo.drivetrain,
      seats: carInfo.seats,
      doors: carInfo.doors,
      engineSize: carInfo.engineSize,
      engineType: carInfo.engineType,
      horsePower: carInfo.horsePower,
      torque: carInfo.torque,
      topSpeed: carInfo.topSpeed,
      acceleration: carInfo.acceleration,
      fuelConsumption: carInfo.fuelConsumption,
      features: carInfo.features,
      slug: `${carInfo.make}-${carInfo.model}-${carInfo.year}-${featuredOrder}`.toLowerCase().replace(/\s+/g, '-').replace(/[()!#]/g, ''),
      description: `Experience the pinnacle of automotive excellence with the ${carInfo.displayName}. This ${carInfo.year} masterpiece combines breathtaking performance with uncompromising luxury, delivering ${carInfo.horsePower} horsepower and a top speed of ${carInfo.topSpeed} mph.`,
      primaryImageUrl: primaryImageUrl || '/placeholder-car.jpg',
      featured: featured,
      featuredOrder: featuredOrder,
      updatedAt: new Date(),
      CarImage: {
        create: carImages
        },
      PriceRule: {
          create: {
          id: randomUUID(),
            basePricePerDay,
            depositAmount,
          currency: 'USD',
            weekendMultiplier: 1.15,
            weeklyDiscount: 0.10,
            monthlyDiscount: 0.20,
            minimumDays: 1,
            maximumDays: 30,
            includedKmPerDay: 200,
          extraKmPrice: 2,
          updatedAt: new Date()
          }
        }
    }
    
    const car = await prisma.car.create({
      data: carCreateData,
      include: {
        PriceRule: true,
        CarImage: true
      }
    })
    cars.push(car)
  }

  // Create add-ons
  console.log('🛠️ Creating add-ons...')
  for (const addOnData of ADD_ONS) {
    await prisma.addOn.create({
      data: {
        id: randomUUID(),
        ...addOnData,
        updatedAt: new Date()
      }
    })
  }

  // Create coupons
  console.log('🎟️ Creating coupons...')
  for (const couponData of COUPONS) {
    await prisma.coupon.create({
      data: {
        id: randomUUID(),
        code: couponData.code,
        description: couponData.description,
        discountType: couponData.discountType,
        discountValue: couponData.discountValue,
        minimumAmount: couponData.minimumAmount || null,
        usageLimit: couponData.usageLimit || null,
        validFrom: couponData.validFrom,
        validUntil: couponData.validUntil,
        isActive: couponData.isActive,
        applicableCarIds: [],
        updatedAt: new Date()
      }
    })
  }

  // Create testimonials
  console.log('⭐ Creating testimonials...')
  for (const testimonialData of TESTIMONIALS) {
    await prisma.testimonial.create({
      data: {
        id: randomUUID(),
        ...testimonialData,
        updatedAt: new Date()
      }
    })
  }

  // Create availability for the next 90 days
  console.log('📅 Creating availability data...')
  const today = new Date()
  for (const car of cars) {
    for (let i = 0; i < 90; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      
      await prisma.availability.create({
        data: {
          id: randomUUID(),
        carId: car.id,
        date,
          isAvailable: true
    }
    })
    }
  }

  // Create a sample booking
  console.log('📋 Creating sample booking...')
  const sampleCar = cars[0]
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 7)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 3)

  const booking = await prisma.booking.create({
    data: {
      id: randomUUID(),
      bookingNumber: `MLR${Date.now()}`,
      userId: customerUser.id,
      carId: sampleCar.id,
      startDate,
      endDate,
      pickupType: 'SHOWROOM',
      returnType: 'SHOWROOM',
      basePriceTotal: 4800, // 3 days * 1600
      feesTotal: 150,
      taxTotal: 495,
      totalAmount: 5445,
      currency: 'USD',
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      includedKm: 600, // 3 days * 200 miles
      confirmedAt: new Date(),
      updatedAt: new Date(),
      BookingAddOn: {
        create: [
          {
            id: randomUUID(),
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
      id: randomUUID(),
      bookingId: booking.id,
      stripePaymentIntentId: `pi_${faker.string.alphanumeric(24)}`,
      amount: String(booking.totalAmount),
      currency: 'USD',
      type: 'RENTAL_FEE',
      method: 'CARD',
      status: 'SUCCEEDED',
      processedAt: new Date(),
      updatedAt: new Date()
    }
  })

  // Create system settings
  console.log('🔧 Creating system settings...')
  const systemSettings = [
    {
      key: 'company_name',
      value: 'Midwest Luxury Rentals',
      description: 'Company name displayed throughout the application',
      category: 'general'
    },
    {
      key: 'company_email',
      value: 'info@midwestluxuryrentals.com',
      description: 'Primary contact email for the company',
      category: 'general'
    },
    {
      key: 'payment_currency',
      value: 'USD',
      description: 'Default currency for payment processing',
      category: 'payment'
    }
  ]

  for (const setting of systemSettings) {
    await prisma.systemSettings.create({
      data: {
        id: randomUUID(),
        ...setting,
        updatedAt: new Date()
      }
    })
  }

  console.log('✅ Database seed completed successfully!')
  console.log(`
    Created:
    - 2 users (admin@midwestluxuryrentals.com, customer@example.com)
    - ${cars.length} exotic cars with images and pricing
    - ${ADD_ONS.length} add-ons
    - ${COUPONS.length} coupons
    - ${TESTIMONIALS.length} testimonials
    - ${systemSettings.length} system settings
    - 1 sample booking with payment
    - 90 days of availability data
    
    🎉 Midwest Luxury Rentals database is ready!
    📍 Location: Chicago, IL
    💵 Currency: USD
    🏢 Company: Midwest Luxury Rentals
    🏎️ Fleet: ${cars.length} exotic vehicles
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
