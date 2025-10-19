'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard,
  Car,
  Calendar,
  Users,
  CreditCard,
  FileText,
  Settings,
  Package,
  MapPin,
  BarChart3,
  MessageSquare,
  Shield,
  Wallet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@valore/ui'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Fleet', href: '/fleet', icon: Car },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Availability', href: '/availability', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Featured Fleet', href: '/featured', icon: Package },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Billing & Payouts', href: '/billing', icon: Wallet },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div 
      className={cn(
        "flex flex-col bg-white border-r border-neutral-200 transition-all duration-300 relative",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-200">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="FlyRentals Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-semibold text-lg text-primary">Falcon Flair Admin</span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/" className="flex items-center justify-center w-full">
            <Image
              src="/logo.png"
              alt="FlyRentals Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </Link>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 z-10 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full p-1.5 hover:shadow-lg hover:scale-110 transition-all duration-200 shadow-md group"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href as any}
              className={cn(
                'sidebar-link',
                isActive && 'active',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-neutral-200">
          <div className="text-xs text-neutral-500">
            <p>© 2025 FlyRentals</p>
            <p className="mt-1">Admin Panel v1.0</p>
          </div>
        </div>
      )}
    </div>
  )
}
