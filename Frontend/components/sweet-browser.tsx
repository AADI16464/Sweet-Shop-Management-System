"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Package, Filter, X, Heart, ShoppingBag, Star, TrendingUp, Zap } from "lucide-react"
import Image from "next/image"
import { apiClient } from "@/lib/api/client"

interface Sweet {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  category: string | null
  quantity: number
  inStock: boolean
}

interface SweetBrowserProps {
  sweets: Sweet[]
}

export function SweetBrowser({ sweets }: SweetBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())

  const filteredSweets = useMemo(() => {
    let filtered = sweets

    if (selectedCategory) {
      filtered = filtered.filter((sweet) => sweet.category === selectedCategory)
    }

    if (!searchTerm) return filtered

    const lowerSearch = searchTerm.toLowerCase()
    return filtered.filter(
      (sweet) =>
        sweet.name.toLowerCase().includes(lowerSearch) ||
        sweet.description?.toLowerCase().includes(lowerSearch) ||
        sweet.category?.toLowerCase().includes(lowerSearch),
    )
  }, [sweets, searchTerm, selectedCategory])

  const categories = useMemo(() => {
    const cats = new Set(sweets.map((s) => s.category).filter(Boolean))
    return Array.from(cats)
  }, [sweets])

  const toggleLike = (id: string) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev)
      newSet.has(id) ? newSet.delete(id) : newSet.add(id)
      return newSet
    })
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl md:text-5xl font-extrabold bg-linear-to-r from-red-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Browse Our Collection
          </h2>
          <Badge className="bg-linear-to-r from-yellow-400 to-orange-400 text-white border-0 px-3 py-1 text-sm font-bold">
            <Zap className="h-3 w-3 mr-1" />
            Fresh Today
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Handpicked traditional & modern sweets from every corner of India 🇮🇳
        </p>
      </div>

      <div className="relative max-w-2xl">
        <div className="absolute inset-0 bg-linear-to-r from-red-500 via-orange-400 to-red-400 rounded-2xl blur-xl opacity-20" />
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500 z-10" />
          <Input
            type="search"
            placeholder="Search for gulab jamun, rasgulla, barfi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 pr-4 h-16 text-lg glass border-2 border-white/50 rounded-2xl"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="space-y-4 glass rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold">Filter by Category</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="rounded-full font-semibold"
            >
              All Sweets
              <Badge variant="secondary" className="ml-2">{sweets.length}</Badge>
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full font-semibold"
              >
                {cat}
                <Badge variant="secondary" className="ml-2">
                  {sweets.filter((s) => s.category === cat).length}
                </Badge>
                {selectedCategory === cat && (
                  <X
                    className="ml-2 h-4 w-4"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedCategory(null)
                    }}
                  />
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {filteredSweets.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center glass rounded-3xl">
          <Package className="h-24 w-24 text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl font-bold mb-3">No sweets found</h3>
          <Button
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory(null)
            }}
            className="bg-linear-to-r from-pink-500 via-orange-400 to-green-400"
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSweets.map((sweet) => (
            <Card key={sweet.id} className="group overflow-hidden glass rounded-3xl">
              <CardHeader className="p-0">
                <div className="relative aspect-square bg-linear-to-br from-red-50 via-orange-50 to-amber-50">
                  <Image
                    src={sweet.imageUrl || "/placeholder.svg"}
                    alt={sweet.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <CardTitle>{sweet.name}</CardTitle>
                <CardDescription>{sweet.description}</CardDescription>
                <Button
                  disabled={!sweet.inStock}
                  onClick={async () => {
                    if (!apiClient.isAuthenticated()) {
                      window.location.href = "/auth/login"
                      return
                    }
                    await apiClient.purchaseSweet(sweet.id, 1)
                    window.location.reload()
                  }}
                  className="w-full bg-linear-to-r from-red-500 via-orange-400 to-red-400"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Purchase
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
