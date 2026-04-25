"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, TrendingUp, DollarSign, AlertCircle, Loader2 } from "lucide-react"
import { SweetTable } from "@/components/sweet-table"
import { SweetDialog } from "@/components/sweet-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient, type Sweet, type Order, type OrderAnalytics } from "@/lib/api/client"
import { Bar, Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js"

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
)

interface AdminDashboardProps {
  sweets: Sweet[]
  onSweetsChange: (sweets: Sweet[]) => void
}

const ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]

export function AdminDashboard({ sweets: initialSweets, onSweetsChange }: AdminDashboardProps) {
  const [sweets, setSweets] = useState(initialSweets)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  useEffect(() => {
    setSweets(initialSweets)
  }, [initialSweets])

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setLoadingOrders(true)
    try {
      const [ordersData, analyticsData] = await Promise.all([apiClient.getAllOrders(), apiClient.getOrderAnalytics()])
      setOrders(ordersData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoadingOrders(false)
    }
  }

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
      const sweetData = new FormData()
      sweetData.append("name", sweet.name)
      sweetData.append("description", sweet.description || "")
      sweetData.append("category", sweet.category || "")
      sweetData.append("price", String(sweet.price))
      sweetData.append("quantity", String(sweet.quantity))
      sweetData.append("imageUrl", sweet.imageUrl || "")

      if (editingSweet) {
        const updated = await apiClient.updateSweet(sweet.id, sweetData)
        const newSweets = sweets.map((s) => (s.id === sweet.id ? updated : s))
        setSweets(newSweets)
        onSweetsChange(newSweets)
      } else {
        const created = await apiClient.createSweet(sweetData)
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

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId)
    try {
      const updatedOrder = await apiClient.updateOrderStatus(orderId, { status })
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)))
      await fetchAdminData()
    } catch (error) {
      console.error("Failed to update order status:", error)
      alert("Failed to update order status.")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const totalSweets = sweets.length
  const inStockSweets = sweets.filter((s) => s.inStock && s.quantity > 0).length
  const outOfStockSweets = totalSweets - inStockSweets
  const avgPrice = sweets.reduce((sum, s) => sum + s.price, 0)

  const statusChartData = useMemo(() => {
    if (!analytics) return null
    return {
      labels: Object.keys(analytics.statusCounts),
      datasets: [
        {
          data: Object.values(analytics.statusCounts),
          backgroundColor: ["#f59e0b", "#3b82f6", "#8b5cf6", "#22c55e", "#ef4444"],
          borderWidth: 0,
        },
      ],
    }
  }, [analytics])

  const revenueChartData = useMemo(() => {
    if (!analytics) return null
    return {
      labels: analytics.revenueByDay.map((d) => d.date),
      datasets: [
        {
          label: "Revenue (INR)",
          data: analytics.revenueByDay.map((d) => d.revenue),
          borderColor: "#f97316",
          backgroundColor: "rgba(249, 115, 22, 0.2)",
          tension: 0.35,
          fill: true,
        },
      ],
    }
  }, [analytics])

  const topSweetsChartData = useMemo(() => {
    if (!analytics) return null
    return {
      labels: analytics.topSweets.map((s) => s.name),
      datasets: [
        {
          label: "Units Sold",
          data: analytics.topSweets.map((s) => s.quantity),
          backgroundColor: "#ef4444",
          borderRadius: 8,
        },
      ],
    }
  }, [analytics])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-red-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg mt-1">Manage inventory, orders, payments, and analytics</p>
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
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.totalOrders || 0}</div>
            <p className="text-xs opacity-80 mt-1">All-time orders</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{(analytics?.totalRevenue || 0).toFixed(2)}</div>
            <p className="text-xs opacity-80 mt-1">Realized amount</p>
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

      {loadingOrders ? (
        <Card className="p-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-2">
            <CardHeader className="bg-linear-to-r from-red-50 to-orange-50">
              <CardTitle>Order Status Split</CardTitle>
              <CardDescription>Live order state distribution</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 h-[320px]">
              {statusChartData ? <Pie data={statusChartData} /> : null}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2">
            <CardHeader className="bg-linear-to-r from-red-50 to-orange-50">
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Day-wise order value</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 h-[320px]">
              {revenueChartData ? (
                <Line
                  data={revenueChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-lg border-2">
            <CardHeader className="bg-linear-to-r from-red-50 to-orange-50">
              <CardTitle>Top Selling Sweets</CardTitle>
              <CardDescription>Most ordered items by quantity</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 h-[320px]">
              {topSweetsChartData ? (
                <Bar
                  data={topSweetsChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-lg border-2">
        <CardHeader className="bg-linear-to-r from-red-50 to-orange-50">
          <CardTitle className="text-2xl">Order Status Tracking</CardTitle>
          <CardDescription className="text-base">Update live order states for shipping visibility</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {orders.slice(0, 8).map((order) => (
            <div key={order.id} className="flex flex-col md:flex-row md:items-center gap-3 justify-between border rounded-xl p-4">
              <div>
                <div className="font-semibold">Order #{order.id.slice(0, 8)}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString()} - ₹{order.total.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Payment: {order.paymentStatus || "PENDING"}</span>
                <Select
                  value={order.status}
                  onValueChange={(status) => handleOrderStatusChange(order.id, status)}
                  disabled={updatingOrderId === order.id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-2">
        <CardHeader className="bg-linear-to-r from-red-50 to-orange-50">
          <CardTitle className="text-2xl">Sweets Inventory</CardTitle>
          <CardDescription className="text-base">View and manage all sweets in your shop</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <SweetTable sweets={sweets} onEdit={handleEdit} onDelete={handleDelete} />
          <div className="mt-4 text-sm text-muted-foreground">Average sweet price: ₹{totalSweets > 0 ? (avgPrice / totalSweets).toFixed(2) : "0.00"}</div>
        </CardContent>
      </Card>

      <SweetDialog open={dialogOpen} onOpenChange={setDialogOpen} sweet={editingSweet} onSave={handleSave} />
    </div>
  )
}
