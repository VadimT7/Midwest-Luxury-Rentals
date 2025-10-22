// Mock vehicle data for Midwest Luxury Rentals

export interface MockVehicle {
  id: string
  slug: string
  displayName: string
  make: string
  model: string
  year: number
  category: string
  bodyType: string
  pricePerDay: number
  primaryImage: string
  featured: boolean
  featuredOrder: number
  specs: {
    transmission: string
    seats: number
    doors: number
  }
}

export const mockVehicles: MockVehicle[] = [
  {
    id: '1',
    slug: 'ferrari-488-black',
    displayName: 'Ferrari 488 Spider',
    make: 'Ferrari',
    model: '488 Spider',
    year: 2024,
    category: 'SUPERCAR',
    bodyType: 'Convertible',
    pricePerDay: 2500,
    primaryImage: '/Ferrari 488 - black.jpg',
    featured: true,
    featuredOrder: 1,
    specs: {
      transmission: 'Automatic',
      seats: 2,
      doors: 2
    }
  },
  {
    id: '2',
    slug: 'ferrari-488-red',
    displayName: 'Ferrari 488 GTB',
    make: 'Ferrari',
    model: '488 GTB',
    year: 2024,
    category: 'SUPERCAR',
    bodyType: 'Coupe',
    pricePerDay: 2400,
    primaryImage: '/Ferrari 488 - red.jpg',
    featured: true,
    featuredOrder: 2,
    specs: {
      transmission: 'Automatic',
      seats: 2,
      doors: 2
    }
  },
  {
    id: '3',
    slug: 'mercedes-g63-amg',
    displayName: 'Mercedes-AMG G63',
    make: 'Mercedes-Benz',
    model: 'G63 AMG',
    year: 2024,
    category: 'SUV',
    bodyType: 'SUV',
    pricePerDay: 1800,
    primaryImage: '/G63-white.jpg',
    featured: true,
    featuredOrder: 3,
    specs: {
      transmission: 'Automatic',
      seats: 5,
      doors: 4
    }
  },
  {
    id: '4',
    slug: 'lamborghini-urus-performante',
    displayName: 'Lamborghini Urus Performante',
    make: 'Lamborghini',
    model: 'Urus Performante',
    year: 2024,
    category: 'SUPERCAR',
    bodyType: 'SUV',
    pricePerDay: 2200,
    primaryImage: '/Lamborghini Urus Performante Blue.jpg',
    featured: true,
    featuredOrder: 4,
    specs: {
      transmission: 'Automatic',
      seats: 5,
      doors: 4
    }
  },
  {
    id: '5',
    slug: 'mclaren-720s',
    displayName: 'McLaren 720S',
    make: 'McLaren',
    model: '720S',
    year: 2024,
    category: 'SUPERCAR',
    bodyType: 'Coupe',
    pricePerDay: 2600,
    primaryImage: '/McLaren Blue.jpg',
    featured: true,
    featuredOrder: 5,
    specs: {
      transmission: 'Automatic',
      seats: 2,
      doors: 2
    }
  },
  {
    id: '6',
    slug: 'lamborghini-urus-hulk',
    displayName: 'Lamborghini Urus',
    make: 'Lamborghini',
    model: 'Urus',
    year: 2024,
    category: 'SUPERCAR',
    bodyType: 'SUV',
    pricePerDay: 2000,
    primaryImage: '/Urus Hulk Green.jpg',
    featured: true,
    featuredOrder: 6,
    specs: {
      transmission: 'Automatic',
      seats: 5,
      doors: 4
    }
  }
]

export function getMockVehicles(options?: {
  featured?: boolean
  category?: string
  limit?: number
}): MockVehicle[] {
  let vehicles = [...mockVehicles]

  if (options?.featured) {
    vehicles = vehicles.filter(v => v.featured)
  }

  if (options?.category && options.category !== 'all') {
    vehicles = vehicles.filter(v => v.category === options.category)
  }

  if (options?.limit) {
    vehicles = vehicles.slice(0, options.limit)
  }

  return vehicles
}

export function getMockVehicleBySlug(slug: string): MockVehicle | undefined {
  return mockVehicles.find(v => v.slug === slug)
}


