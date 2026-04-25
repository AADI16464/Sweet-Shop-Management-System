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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSweets() {
      try {
        const data = await apiClient.getSweets()
        setSweets(data)
        setError(null)
      } catch (error: any) {
        console.error("Failed to fetch sweets:", error)
        setError(error.message || "Failed to connect to backend")
        setSweets([])
      } finally {
        setLoading(false)
      }
    }
    fetchSweets()
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden transition-colors">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(239,68,68,0.12),transparent_28%),radial-gradient(circle_at_86%_20%,rgba(249,115,22,0.12),transparent_30%),radial-gradient(circle_at_50%_92%,rgba(245,158,11,0.10),transparent_34%)]" />
      <div className="logo-bg" />
      <div className="logo-bg-overlay">
        <Header />

      <div className="relative py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="rounded-[2rem] border border-border/70 bg-card/80 backdrop-blur-sm px-6 py-12 md:px-12 md:py-14 shadow-[0_20px_70px_-45px_rgba(220,38,38,0.65)]">
            <div className="flex flex-col items-center text-center space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200/80 bg-red-50 px-4 py-2 dark:border-red-900 dark:bg-red-950/60">
              <TrendingUp className="h-4 w-4 text-red-600" />
              <span className="text-xs font-semibold tracking-wide text-red-700 dark:text-red-300">Most Popular in India</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground flex flex-wrap items-center justify-center gap-3 text-balance leading-tight">
              India's #1 Sweet Shop
              <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-red-500" />
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl text-pretty font-medium leading-relaxed">
              Discover 100+ authentic Indian sweets & treats delivered fresh to your doorstep
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-5 py-3 shadow-sm">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <div className="text-left">
                  <div className="text-foreground font-bold text-xl">4.9/5</div>
                  <div className="text-muted-foreground text-xs font-medium">Average Rating</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-5 py-3 shadow-sm">
                <Award className="h-5 w-5 text-red-500" />
                <div className="text-left">
                  <div className="text-foreground font-bold text-xl">10K+</div>
                  <div className="text-muted-foreground text-xs font-medium">Happy Customers</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-5 py-3 shadow-sm">
                <Clock className="h-5 w-5 text-orange-500" />
                <div className="text-left">
                  <div className="text-foreground font-bold text-xl">24/7</div>
                  <div className="text-muted-foreground text-xs font-medium">Service</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-10 left-10 w-32 h-32 bg-red-300/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-20 right-20 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-10 left-1/3 w-24 h-24 bg-amber-300/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 rounded-2xl bg-card/90 border border-border/70 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300 rounded-2xl">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Free Delivery</h3>
                <p className="text-sm text-muted-foreground">On orders above ₹500</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 rounded-2xl bg-card/90 border border-border/70 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300 rounded-2xl">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Premium Quality</h3>
                <p className="text-sm text-muted-foreground">Fresh & authentic sweets daily</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 rounded-2xl bg-card/90 border border-border/70 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300 rounded-2xl">
                <Star className="h-6 w-6" />
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
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-2xl font-bold mb-4 text-red-600">Backend Server Not Running</div>
            <div className="text-muted-foreground mb-4 max-w-md">
              {error}
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm mb-4">
              <div>cd Backend</div>
              <div>npm run dev</div>
            </div>
            <div className="text-sm text-muted-foreground">
              See START_BOTH.md for detailed instructions
            </div>
          </div>
        ) : sweets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-2xl font-bold mb-4 text-orange-600">No Sweets Found</div>
            <div className="text-muted-foreground mb-4 max-w-md">
              The database is connected but no sweets have been added yet.
            </div>
          </div>
        ) : (
          <SweetBrowser sweets={sweets} />
        )}
      </main>
      </div>
    </div>
  </div>
  )
}
