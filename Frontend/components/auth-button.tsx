"use client"

import { useAuth } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import Link from "next/link"

export function AuthButton() {
  const { user, logout, loading } = useAuth()

  if (loading) {
    return <div className="w-20 h-9" /> // Placeholder for loading state
  }

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/auth/login">
          <User className="h-4 w-4 mr-2" />
          Login
        </Link>
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">{user.displayName || user.email}</span>
      <Button variant="outline" size="sm" onClick={logout}>
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  )
}
