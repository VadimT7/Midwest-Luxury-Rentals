export interface FleetCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: 'luxury' | 'sport' | 'suv' | 'electric' | 'supercar';
  transmission: 'automatic' | 'manual';
  seats: number;
  pricePerDay: number;
  featured: boolean;
  specs: {
    engine?: string;
    power?: string;
    acceleration?: string;
    topSpeed?: string;
  };
  images: {
    primary: string;
    gallery: string[];
  };
  video?: string;
}

export const FLEET_DATA: FleetCar[] = [
  {
    id: 'ferrari-488-gtb',
    brand: 'Ferrari',
    model: '488 GTB',
    year: 2024,
    category: 'supercar',
    transmission: 'automatic',
    seats: 2,
    pricePerDay: 2999,
    featured: true,
    specs: {
      engine: '3.9L V8 Twin-Turbo',
      power: '670 HP',
      acceleration: '0-60 mph in 3.0s',
      topSpeed: '330 km/h'
    },
    images: {
      primary: '/Ferrari 488 - black.jpg',
      gallery: [
        '/Ferrari 488 - black.jpg',
        '/Ferrari 488 - red.jpg'
      ]
    }
  },
  {
    id: 'ferrari-488-gtb-red',
    brand: 'Ferrari',
    model: '488 GTB',
    year: 2024,
    category: 'supercar',
    transmission: 'automatic',
    seats: 2,
    pricePerDay: 2999,
    featured: true,
    specs: {
      engine: '3.9L V8 Twin-Turbo',
      power: '670 HP',
      acceleration: '0-60 mph in 3.0s',
      topSpeed: '330 km/h'
    },
    images: {
      primary: '/Ferrari 488 - red.jpg',
      gallery: [
        '/Ferrari 488 - red.jpg',
        '/Ferrari 488 - black.jpg'
      ]
    }
  },
  {
    id: 'mercedes-g63-amg',
    brand: 'Mercedes-Benz',
    model: 'G63 AMG',
    year: 2024,
    category: 'suv',
    transmission: 'automatic',
    seats: 5,
    pricePerDay: 1999,
    featured: true,
    specs: {
      engine: '4.0L V8 Twin-Turbo',
      power: '577 HP',
      acceleration: '0-60 mph in 4.5s',
      topSpeed: '220 km/h'
    },
    images: {
      primary: '/G63-white.jpg',
      gallery: [
        '/G63-white.jpg'
      ]
    }
  },
  {
    id: 'lamborghini-urus-performante',
    brand: 'Lamborghini',
    model: 'Urus Performante',
    year: 2024,
    category: 'suv',
    transmission: 'automatic',
    seats: 5,
    pricePerDay: 2499,
    featured: true,
    specs: {
      engine: '4.0L V8 Twin-Turbo',
      power: '666 HP',
      acceleration: '0-60 mph in 3.3s',
      topSpeed: '306 km/h'
    },
    images: {
      primary: '/Lamborghini Urus Performante Blue.jpg',
      gallery: [
        '/Lamborghini Urus Performante Blue.jpg'
      ]
    }
  },
  {
    id: 'mclaren-720s',
    brand: 'McLaren',
    model: '720S',
    year: 2024,
    category: 'supercar',
    transmission: 'automatic',
    seats: 2,
    pricePerDay: 3499,
    featured: true,
    specs: {
      engine: '4.0L V8 Twin-Turbo',
      power: '710 HP',
      acceleration: '0-60 mph in 2.9s',
      topSpeed: '341 km/h'
    },
    images: {
      primary: '/McLaren Blue.jpg',
      gallery: [
        '/McLaren Blue.jpg'
      ]
    }
  },
  {
    id: 'lamborghini-urus-hulk',
    brand: 'Lamborghini',
    model: 'Urus',
    year: 2024,
    category: 'suv',
    transmission: 'automatic',
    seats: 5,
    pricePerDay: 2299,
    featured: true,
    specs: {
      engine: '4.0L V8 Twin-Turbo',
      power: '641 HP',
      acceleration: '0-60 mph in 3.6s',
      topSpeed: '305 km/h'
    },
    images: {
      primary: '/Urus Hulk Green.jpg',
      gallery: [
        '/Urus Hulk Green.jpg'
      ]
    }
  }
];