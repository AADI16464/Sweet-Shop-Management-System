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
  onSave: (formData: FormData) => void
}

export function SweetDialog({ open, onOpenChange, sweet, onSave }: SweetDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    quantity: "0",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (sweet) {
      setFormData({
        name: sweet.name,
        description: sweet.description || "",
        price: sweet.price.toString(),
        category: sweet.category || "",
        quantity: sweet.quantity.toString(),
      })
      setImagePreview(sweet.imageUrl)
      setImageFile(null)
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        quantity: "0",
      })
      setImagePreview(null)
      setImageFile(null)
    }
  }, [sweet])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const data = new FormData()
    data.append("name", formData.name)
    data.append("description", formData.description)
    data.append("price", formData.price)
    data.append("category", formData.category)
    data.append("quantity", formData.quantity)
    
    if (imageFile) {
      data.append("image", imageFile)
    }

    onSave(data)
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{sweet ? "Edit Sweet" : "Add New Sweet"}</DialogTitle>
            <DialogDescription>
              {sweet
                ? "Update the details of this sweet"
                : "Add a new sweet to your inventory"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Gulab Jamun, Rasgulla, Kaju Katli"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Taste, texture, ingredients..."
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
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
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
              <Label htmlFor="image">Sweet Image</Label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview.startsWith("data:") ? imagePreview : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4005"}${imagePreview}`}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
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
              className="bg-linear-to-r from-red-500 via-orange-400 to-red-400"
            >
              {isLoading ? "Saving..." : sweet ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
