"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, TrendingUp, DollarSign, AlertCircle } from "lucide-react"
import { SweetTable } from "@/components/sweet-table"
import { SweetDialog } from "@/components/sweet-dialog"
import { apiClient, type Sweet } from "@/lib/api/client"

interface AdminDashboardProps {
  sweets: Sweet[]
  onSweetsChange: (sweets: Sweet[]) => void
}

export function AdminDashboard({ sweets: initialSweets, onSweetsChange }: AdminDashboardProps) {
  const [sweets, setSweets] = useState(initialSweets)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null)

  useEffect(() => {
    setSweets(initialSweets)
  }, [initialSweets])

  const handleAdd = () => {
    setEditingSweet(null)
    setDialogOpen(true)
  }

  const handleEdit = (sweet: Sweet) => {
    setEditingSweet(sweet)
    setDialogOpen(true)
  }

  const handleSave = async (sweet: Sweet) => {
    try {
      if (editingSweet) {
        const updated = await apiClient.updateSweet(sweet.id, {
          name: sweet.name,
          description: sweet.description || undefined,
          category: sweet.category || undefined,
          price: sweet.price,
          quantity: sweet.quantity,
          imageUrl: sweet.imageUrl || undefined,
        })
        const newSweets = sweets.map((s) => (s.id === sweet.id ? updated : s))
        setSweets(newSweets)
        onSweetsChange(newSweets)
      } else {
        const created = await apiClient.createSweet({
          name: sweet.name,
          description: sweet.description || undefined,
          category: sweet.category || undefined,
          price: sweet.price,
          quantity: sweet.quantity,
          imageUrl: sweet.imageUrl || undefined,
        })
        const newSweets = [created, ...sweets]
        setSweets(newSweets)
        onSweetsChange(newSweets)
      }
      setDialogOpen(false)
    } catch (error) {
      console.error("Failed to save sweet:", error)
      alert("Failed to save sweet. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteSweet(id)
      const newSweets = sweets.filter((s) => s.id !== id)
      setSweets(newSweets)
      onSweetsChange(newSweets)
    } catch (error) {
      console.error("Failed to delete sweet:", error)
      alert("Failed to delete sweet. Please try again.")
    }
  }

  const totalSweets = sweets.length
  const inStockSweets = sweets.filter((s) => s.inStock && s.quantity > 0).length
  const outOfStockSweets = totalSweets - inStockSweets
  const totalValue = sweets.reduce((sum, s) => sum + s.price, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-red-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            Manage your sweet shop inventory
          </p>
        </div>

        <Button
          onClick={handleAdd}
          size="lg"
          className="bg-linear-to-r from-red-500 via-orange-400 to-red-400 hover:shadow-xl transition-all text-white font-semibold"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Sweet
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sweets</CardTitle>
            <Package className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSweets}</div>
            <p className="text-xs opacity-80 mt-1">Complete inventory</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inStockSweets}</div>
            <p className="text-xs opacity-80 mt-1">Available for sale</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
            <DollarSign className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{totalSweets > 0 ? (totalValue / totalSweets).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs opacity-80 mt-1">Per kilogram</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertCircle className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{outOfStockSweets}</div>
            <p className="text-xs opacity-80 mt-1">Needs restocking</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-2">
        <CardHeader className="bg-linear-to-r from-red-50 to-orange-50">
          <CardTitle className="text-2xl">Sweets Inventory</CardTitle>
          <CardDescription className="text-base">
            View and manage all sweets in your shop
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <SweetTable sweets={sweets} onEdit={handleEdit} onDelete={handleDelete} />
        </CardContent>
      </Card>

      <SweetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sweet={editingSweet}
        onSave={handleSave}
      />
    </div>
  )
}
