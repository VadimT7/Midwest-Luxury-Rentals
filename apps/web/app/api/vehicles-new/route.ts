import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// New Midwest Luxury vehicles data
const NEW_VEHICLES = [
  {
    id: '1',
    slug: 'ferrari-488-gtb-black',
    displayName: '2024 Ferrari 488 GTB',
    make: 'Ferrari',
    model: '488 GTB',
    year: 2024,
    category: 'SUPERCAR',
    bodyType: 'COUPE',
    description: 'Experience the pinnacle of Italian automotive excellence with the Ferrari 488 GTB. This mid-engine supercar features a 3.9-liter V8 twin-turbo engine producing 670 horsepower, accelerating from 0-100 km/h in just 3.0 seconds. With its F1-derived aerodynamics, advanced traction control systems, and iconic Ferrari styling, the 488 GTB represents the perfect fusion of performance and artistry. Available at 2,999 AED per day.',
    primaryImage: '/Ferrari 488 - black.jpg',
    pricePerDay: 2999,
    featured: true,
    featuredOrder: 1,
    specs: {
      transmission: 'AUTOMATIC',
      seats: 2,
      doors: 2
    }
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
    description: 'Experience the pinnacle of Italian automotive excellence with the Ferrari 488 GTB in iconic Rosso Corsa. This mid-engine supercar features a 3.9-liter V8 twin-turbo engine producing 670 horsepower, accelerating from 0-100 km/h in just 3.0 seconds. With its F1-derived aerodynamics, advanced traction control systems, and iconic Ferrari styling in the classic red finish, the 488 GTB represents the perfect fusion of performance and artistry. Available at 2,999 AED per day.',
    primaryImage: '/Ferrari 488 - red.jpg',
    pricePerDay: 2999,
    featured: true,
    featuredOrder: 2,
    specs: {
      transmission: 'AUTOMATIC',
      seats: 2,
      doors: 2
    }
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
    description: 'Experience the ultimate luxury SUV with the Mercedes-Benz G63 AMG. This iconic off-road legend features a 4.0-liter V8 twin-turbo engine producing 577 horsepower, accelerating from 0-100 km/h in just 4.5 seconds. With its legendary three-locking differentials, adaptive air suspension, and opulent interior featuring Burmester premium sound, the G63 AMG combines uncompromising off-road capability with supreme luxury. Available at 1,999 AED per day.',
    primaryImage: '/G63-white.jpg',
    pricePerDay: 1999,
    featured: true,
    featuredOrder: 3,
    specs: {
      transmission: 'AUTOMATIC',
      seats: 5,
      doors: 4
    }
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
    description: 'Experience the ultimate super SUV with the Lamborghini Urus Performante. This high-performance SUV features a 4.0-liter V8 twin-turbo engine producing 666 horsepower, accelerating from 0-100 km/h in just 3.3 seconds. With its Performante aerodynamics, adaptive air suspension, and carbon ceramic brakes, the Urus Performante delivers supercar performance in an SUV package. Available at 2,499 AED per day.',
    primaryImage: '/Lamborghini Urus Performante Blue.jpg',
    pricePerDay: 2499,
    featured: true,
    featuredOrder: 4,
    specs: {
      transmission: 'AUTOMATIC',
      seats: 5,
      doors: 4
    }
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
    description: 'Experience the pinnacle of British supercar engineering with the McLaren 720S. This mid-engine masterpiece features a 4.0-liter V8 twin-turbo engine producing 710 horsepower, accelerating from 0-100 km/h in just 2.9 seconds. With its active aerodynamics, ProActive chassis control, and carbon fiber monocage, the 720S delivers Formula 1-inspired performance on the road. Available at 3,499 AED per day.',
    primaryImage: '/McLaren Blue.jpg',
    pricePerDay: 3499,
    featured: true,
    featuredOrder: 5,
    specs: {
      transmission: 'AUTOMATIC',
      seats: 2,
      doors: 2
    }
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
    description: 'Experience the ultimate super SUV with the Lamborghini Urus in striking Hulk Green. This high-performance SUV features a 4.0-liter V8 twin-turbo engine producing 641 horsepower, accelerating from 0-100 km/h in just 3.6 seconds. With its adaptive air suspension, carbon ceramic brakes, and distinctive green finish, the Urus delivers supercar performance in an SUV package. Available at 2,299 AED per day.',
    primaryImage: '/Urus Hulk Green.jpg',
    pricePerDay: 2299,
    featured: true,
    featuredOrder: 6,
    specs: {
      transmission: 'AUTOMATIC',
      seats: 5,
      doors: 4
    }
  }
]

export async function GET() {
  try {
    return NextResponse.json(NEW_VEHICLES)
  } catch (error) {
    console.error('Failed to fetch new vehicles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    )
  }
}
