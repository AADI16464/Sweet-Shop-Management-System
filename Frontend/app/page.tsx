"use client"

import { useEffect, useState } from "react"
import { SweetBrowser } from "@/components/sweet-browser"
import { Header } from "@/components/header"
import { Sparkles, TrendingUp, Star, Award, Clock, Truck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { apiClient, type Sweet } from "@/lib/api/client"

export default function HomePage() {
  const [sweets, setSweets] = useState<Sweet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSweets() {
      try {
        const data = await apiClient.getSweets()
        setSweets(data)
      } catch (error) {
        console.error("Failed to fetch sweets:", error)
        // Set empty array on error so UI shows helpful message
        setSweets([])
      } finally {
        setLoading(false)
      }
    }
    fetchSweets()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative">
      <div className="logo-bg" />
      <div className="logo-bg-overlay">
        <Header />

      <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-red-400 to-orange-500 py-16 md:py-20 animate-gradient">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-6 animate-slide-up">
            <div className="flex items-center gap-2 glass px-5 py-2.5 rounded-full shadow-2xl animate-float">
              <TrendingUp className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">Most Popular in India 🔥</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl flex flex-wrap items-center justify-center gap-4 text-balance leading-tight">
              India's #1 Sweet Shop
              <Sparkles className="h-10 w-10 md:h-14 md:w-14 text-yellow-300 animate-pulse" />
            </h1>
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl text-pretty font-medium leading-relaxed">
              Discover 100+ authentic Indian sweets & treats delivered fresh to your doorstep
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
              <div className="flex items-center gap-3 glass px-6 py-3 rounded-2xl shadow-2xl hover:scale-105 transition-transform">
                <Star className="h-6 w-6 text-yellow-300 fill-yellow-300" />
                <div className="text-left">
                  <div className="text-white font-black text-2xl">4.9/5</div>
                  <div className="text-white/80 text-xs font-medium">Rating</div>
                </div>
              </div>
              <div className="flex items-center gap-3 glass px-6 py-3 rounded-2xl shadow-2xl hover:scale-105 transition-transform">
                <Award className="h-6 w-6 text-yellow-300" />
                <div className="text-left">
                  <div className="text-white font-black text-2xl">10K+</div>
                  <div className="text-white/80 text-xs font-medium">Happy Customers</div>
                </div>
              </div>
              <div className="flex items-center gap-3 glass px-6 py-3 rounded-2xl shadow-2xl hover:scale-105 transition-transform">
                <Clock className="h-6 w-6 text-yellow-300" />
                <div className="text-left">
                  <div className="text-white font-black text-2xl">24/7</div>
                  <div className="text-white/80 text-xs font-medium">Service</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-20 right-20 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-10 left-1/3 w-24 h-24 bg-white/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-white/50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Free Delivery</h3>
                <p className="text-sm text-muted-foreground">On orders above ₹500</p>
              </div>
            </div>
          </Card>
          <Card className="glass p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-white/50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Premium Quality</h3>
                <p className="text-sm text-muted-foreground">Fresh & authentic sweets daily</p>
              </div>
            </div>
          </Card>
          <Card className="glass p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-white/50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl shadow-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Top Rated</h3>
                <p className="text-sm text-muted-foreground">Loved by 10,000+ customers</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-lg text-muted-foreground">Loading sweets...</div>
          </div>
        ) : sweets.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-2xl font-bold mb-4 text-red-600">Backend Server Not Running</div>
            <div className="text-muted-foreground mb-4 max-w-md">
              The backend server needs to be running on port 4000. Please start it:
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm mb-4">
              <div>cd Backend</div>
              <div>npm run dev</div>
            </div>
            <div className="text-sm text-muted-foreground">
              See START_BOTH.md for detailed instructions
            </div>
          </div>
        ) : (
          <SweetBrowser sweets={sweets} />
        )}
      </main>
      </div>
    </div>
  )
}
