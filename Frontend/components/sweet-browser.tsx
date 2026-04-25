"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Package, ShoppingBag, Zap } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/lib/cart/context"
import { useAuth } from "@/lib/auth/context"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils"

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
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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

  const handleAddToCart = (sweet: any) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart", {
        description: "You need an account to place orders."
      })
      return
    }
    
    addItem(sweet, 1)
    toast.success(`${sweet.name} added to cart!`, {
      description: "You can view your cart in the top right corner."
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Browse Our Collection
          </h2>
          <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900 px-3 py-1 text-sm font-semibold">
            <Zap className="h-3 w-3 mr-1" />
            Fresh Today
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Handpicked traditional & modern sweets from every corner of India 🇮🇳
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500 z-10" />
          <Input
            type="search"
            placeholder="Search for sweets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 h-14 rounded-2xl bg-card/90 border-border/70"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            className="rounded-xl whitespace-nowrap"
            onClick={() => setSelectedCategory(null)}
          >
            All Sweets
          </Button>
          {categories.map((cat: any) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="rounded-xl whitespace-nowrap"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filteredSweets.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center glass rounded-3xl">
          <Package className="h-24 w-24 text-muted-foreground/30 mb-4" />
          <h3 className="text-2xl font-bold">No sweets found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSweets.map((sweet) => (
            <Card key={sweet.id} className="group overflow-hidden rounded-3xl border-border/70 bg-card/90 transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="p-0">
                <div className="relative aspect-square">
                  <Image
                    src={getImageUrl(sweet.imageUrl)}
                    alt={sweet.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-110 duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Badge className="absolute top-4 right-4 bg-background/95 text-foreground font-bold px-3 py-1 rounded-full shadow-sm border border-border/70">
                    ₹{sweet.price}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black line-clamp-1">{sweet.name}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[3rem]">{sweet.description}</CardDescription>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge variant="secondary" className="rounded-lg">{sweet.category || "General"}</Badge>
                  <span className={`text-xs font-bold ${sweet.quantity > 10 ? 'text-green-500' : 'text-red-500'}`}>
                    {sweet.quantity} in stock
                  </span>
                </div>

                <Button
                  disabled={!sweet.inStock}
                  onClick={() => handleAddToCart(sweet)}
                  className={`w-full h-12 rounded-2xl font-semibold transition-all active:scale-95 ${
                    sweet.inStock ? "bg-primary hover:bg-primary/90" : "bg-muted"
                  }`}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {sweet.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
