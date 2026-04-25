"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { AdminDashboard } from "@/components/admin-dashboard"
import { apiClient, type Sweet } from "@/lib/api/client"
import { useAuth } from "@/lib/auth/context"

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const [sweets, setSweets] = useState<Sweet[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Wait until auth state is resolved
    if (authLoading) return

    // Not logged in → redirect
    if (!user) {
      router.replace("/auth/login")
      return
    }

    // Logged in but not admin → redirect
    if (!user.isAdmin) {
      router.push("/");
    }

    // Admin user → fetch sweets
    const fetchSweets = async () => {
      try {
        const data = await apiClient.getSweets()
        setSweets(data)
      } catch (error) {
        console.error("Failed to fetch sweets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSweets()
  }, [user, authLoading, router])

  // Loading screen
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Safety fallback
  if (!user || !user.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-red-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <AdminDashboard sweets={sweets} onSweetsChange={setSweets} />
      </main>
    </div>
  )
}
