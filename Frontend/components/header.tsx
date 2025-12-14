"use client"

import { ShieldCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AuthButton } from "@/components/auth-button"
import { useAuth } from "@/lib/auth/context"

export function Header() {
  const { user } = useAuth()
  const isAdmin = user?.isAdmin

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-lg shadow-lg">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-16 w-16 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="Sweet Shop Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:bg-primary hover:text-primary-foreground bg-secondary text-secondary-foreground shadow-md hover:shadow-lg"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
          <AuthButton />
        </nav>
      </div>
    </header>
  )
}
