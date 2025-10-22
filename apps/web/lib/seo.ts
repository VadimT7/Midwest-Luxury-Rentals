import type { Metadata } from 'next'

interface GenerateMetadataParams {
  title?: string
  description?: string
  keywords?: string[]
  openGraph?: {
    title?: string
    description?: string
    images?: Array<{
      url: string
      width?: number
      height?: number
      alt?: string
    }>
  }
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player'
    title?: string
    description?: string
    images?: string[]
  }
}

const siteConfig = {
  name: 'Midwest Luxury Car Rental',
  title: 'Midwest Luxury Car Rental - Premium Car Rental in Dubai',
  description: 'Experience the pinnacle of automotive luxury in Dubai. Rent BMW M440, Mercedes CLE 53 AMG, Audi RS3, and more. Premium service with 24/7 support.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://valorerent.com',
  keywords: [
    'luxury car rental Dubai',
    'exotic car rental Dubai',
    'premium car rental UAE',
    'BMW rental Dubai',
    'Mercedes rental Dubai',
    'Audi RS3 rental',
    'Dubai car rental',
    'luxury cars UAE',
    'premium car rental',
    'supercar rental Dubai',
  ],
}

export function generateMetadata(params: GenerateMetadataParams = {}): Metadata {
  const {
    title = siteConfig.title,
    description = siteConfig.description,
    keywords = siteConfig.keywords,
    openGraph,
    twitter,
  } = params

  const metadata: Metadata = {
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    keywords: keywords.join(', '),
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: openGraph?.title || title,
      description: openGraph?.description || description,
      images: openGraph?.images || [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: twitter?.card || 'summary_large_image',
      title: twitter?.title || title,
      description: twitter?.description || description,
      images: twitter?.images || ['/twitter-image.jpg'],
      creator: '@valorerent',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
      other: [
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          url: '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          url: '/favicon-16x16.png',
        },
      ],
    },
  }

  return metadata
}

export function generateJsonLd(type: 'Organization' | 'Car' | 'RentalCarReservation', data: any) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
  }

  switch (type) {
    case 'Organization':
      return {
        ...baseData,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo.png`,
        description: siteConfig.description,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Dubai',
          addressCountry: 'AE',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+971-585-046-440',
          contactType: 'customer service',
          availableLanguage: ['English', 'Arabic', 'Turkish'],
        },
        sameAs: [
          'https://www.instagram.com/falconflaircars',
          'https://www.facebook.com/falconflaircars',
        ],
      }

    case 'Car':
      return {
        ...baseData,
        name: data.name,
        brand: {
          '@type': 'Brand',
          name: data.brand,
        },
        model: data.model,
        vehicleModelDate: data.year,
        vehicleConfiguration: data.configuration,
        vehicleEngine: {
          '@type': 'EngineSpecification',
          enginePower: {
            '@type': 'QuantitativeValue',
            value: data.horsePower,
            unitCode: 'HP',
          },
        },
        speed: {
          '@type': 'QuantitativeValue',
          value: data.topSpeed,
          unitCode: 'KMH',
        },
        offers: {
          '@type': 'Offer',
          price: data.pricePerDay,
          priceCurrency: 'AED',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: siteConfig.name,
          },
        },
        image: data.images,
        ...data,
      }

    case 'RentalCarReservation':
      return {
        ...baseData,
        reservationNumber: data.bookingNumber,
        reservationStatus: data.status,
        underName: {
          '@type': 'Person',
          name: data.customerName,
        },
        reservationFor: {
          '@type': 'RentalCar',
          name: data.carName,
          model: data.carModel,
        },
        pickupLocation: {
          '@type': 'Place',
          name: data.pickupLocation,
        },
        pickupTime: data.pickupTime,
        dropoffLocation: {
          '@type': 'Place',
          name: data.dropoffLocation,
        },
        dropoffTime: data.dropoffTime,
        price: data.totalPrice,
        priceCurrency: 'AED',
        ...data,
      }

    default:
      return baseData
  }
}
