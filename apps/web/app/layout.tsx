import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { generateMetadata as generateSiteMetadata } from '@/lib/seo'
import { Header, Footer } from '@/components/layout'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  ...generateSiteMetadata({
    title: 'Falcon Flair Car Rental - Premium Car Rental in Dubai',
    description: 'Experience the pinnacle of automotive luxury in Dubai. Rent BMW M440, Mercedes CLE 53 AMG, Audi RS3, ROX 01 VIP and more. Premium service with 24/7 support.',
  }),
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased">
        <Providers>
          <Header />
          {children}
          <Footer />
          <Toaster />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
