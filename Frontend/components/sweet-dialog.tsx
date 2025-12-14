"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Sweet } from "@/lib/api/client"

const INDIAN_SWEET_CATEGORIES = [
  "Milk-based",
  "Fried",
  "Barfi",
  "Laddu",
  "Halwa",
  "Pudding",
  "Frozen",
  "Sugar-based",
  "Yogurt-based",
  "Baked",
  "Bread-based",
  "Rice-based",
  "Steamed",
]

interface SweetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sweet: Sweet | null
  onSave: (sweet: Sweet) => void
}

export function SweetDialog({ open, onOpenChange, sweet, onSave }: SweetDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    quantity: "0",
  })

  useEffect(() => {
    if (sweet) {
      setFormData({
        name: sweet.name,
        description: sweet.description || "",
        price: sweet.price.toString(),
        category: sweet.category || "",
        imageUrl: sweet.imageUrl || "",
        quantity: sweet.quantity.toString(),
      })
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        imageUrl: "",
        quantity: "0",
      })
    }
  }, [sweet])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const sweetData: Partial<Sweet> & { name: string; price: number; quantity: number } = {
      name: formData.name,
      description: formData.description || undefined,
      price: Number.parseFloat(formData.price),
      category: formData.category || undefined,
      imageUrl: formData.imageUrl || undefined,
      quantity: Number.parseInt(formData.quantity) || 0,
    }

    if (sweet) {
      // Update existing sweet
      const updated: Sweet = {
        ...sweet,
        ...sweetData,
      }
      onSave(updated)
    } else {
      // Create new sweet
      const newSweet: Sweet = {
        id: "", // Will be set by backend
        name: sweetData.name,
        description: sweetData.description || null,
        price: sweetData.price,
        category: sweetData.category || null,
        imageUrl: sweetData.imageUrl || null,
        quantity: sweetData.quantity,
        inStock: sweetData.quantity > 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      onSave(newSweet)
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{sweet ? "Edit Sweet" : "Add New Sweet"}</DialogTitle>
            <DialogDescription>
              {sweet ? "Update the details of this sweet" : "Add a new sweet to your inventory"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Gulab Jamun, Rasgulla, Kaju Katli"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the sweet's taste, texture, and ingredients..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹/kg) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="50.00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_SWEET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="/indian-sweet.jpg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-red-500 via-orange-400 to-red-400 hover:shadow-lg"
            >
              {isLoading ? "Saving..." : sweet ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
