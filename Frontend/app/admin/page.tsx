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
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login")
        return
      }
      if (!user.isAdmin) {
        router.push("/")
        return
      }
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function fetchSweets() {
      if (user?.isAdmin) {
        try {
          const data = await apiClient.getSweets()
          setSweets(data)
        } catch (error) {
          console.error("Failed to fetch sweets:", error)
        } finally {
          setLoading(false)
        }
      }
    }
    if (user?.isAdmin) {
      fetchSweets()
    }
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative flex items-center justify-center">
        <div className="logo-bg" />
        <div className="text-lg text-muted-foreground relative z-10">Loading...</div>
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative">
      <div className="logo-bg" />
      <div className="logo-bg-overlay">
        <Header />
      <main className="container mx-auto px-4 py-8">
        <AdminDashboard sweets={sweets} onSweetsChange={setSweets} />
      </main>
      </div>
    </div>
  )
}
