"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/context"
import { apiClient, type Order } from "@/lib/api/client"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, Phone, ShoppingBag, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const { user, setUser, isAuthenticated, loading } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  const [formData, setFormData] = useState({
    displayName: "",
    mobileNumber: "",
    deliveryAddress: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        mobileNumber: user.mobileNumber || "",
        deliveryAddress: user.deliveryAddress || "",
      })
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const data = await apiClient.getOrders()
      setOrders(data)
    } catch (error) {
      console.error("Failed to fetch orders", error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const updatedUser = await apiClient.updateProfile(formData)
      setUser(updatedUser)
      toast.success("Profile updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Card className="max-w-md w-full glass text-center p-8">
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Please log in</h1>
            <p className="text-muted-foreground mb-6">You need to be logged in to view and manage your profile.</p>
            <Button asChild className="w-full rounded-xl">
              <a href="/auth/login">Login / Sign up</a>
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-12 px-4 max-w-5xl">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-black mb-2">Account Center</h1>
            <p className="text-muted-foreground">Manage your profile, addresses, and track your sweet orders.</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="glass border-white/20 dark:border-white/10 p-1 rounded-2xl w-full sm:w-auto h-auto grid grid-cols-2 sm:flex">
              <TabsTrigger value="profile" className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <User className="h-4 w-4 mr-2" />
                Profile Details
              </TabsTrigger>
              <TabsTrigger value="orders" className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <ShoppingBag className="h-4 w-4 mr-2" />
                My Orders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-8">
              <Card className="glass border-white/20 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="bg-primary/5 pb-8 pt-10 px-8 border-b border-white/10">
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-black shadow-xl">
                      {user?.displayName ? user.displayName[0].toUpperCase() : user?.email[0].toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-black">{user?.displayName || "Profile Details"}</CardTitle>
                      <CardDescription className="text-lg">{user?.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-sm font-bold ml-1">Full Name</Label>
                        <Input
                          id="displayName"
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          className="h-12 rounded-xl"
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobileNumber" className="text-sm font-bold ml-1">Mobile Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                            className="h-12 rounded-xl pl-12"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryAddress" className="text-sm font-bold ml-1">Default Delivery Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          id="deliveryAddress"
                          value={formData.deliveryAddress}
                          onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                          className="min-h-[120px] rounded-2xl pl-12 pt-3"
                          placeholder="House No, Street, Landmark, City, Pincode"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isUpdating}
                      className="h-14 rounded-2xl px-12 font-bold text-lg shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-8">
              {ordersLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : orders.length > 0 ? (
                <div className="grid gap-6">
                  {orders.map((order) => (
                    <Card key={order.id} className="glass border-white/20 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                      <CardHeader className="flex flex-row items-center justify-between p-6 bg-muted/30">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order ID</p>
                          <p className="font-mono text-sm">{order.id.split('-')[0]}...</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Date</p>
                          <p className="text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                        </div>
                         <Badge className={
                          order.status === 'DELIVERED'
                            ? 'bg-green-500 hover:bg-green-600'
                            : order.status === 'SHIPPED'
                              ? 'bg-blue-500 hover:bg-blue-600'
                              : order.status === 'CANCELLED'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-yellow-500 hover:bg-yellow-600'
                        }>
                          {order.status}
                         </Badge>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <div className="flex gap-4 items-center">
                                <div className="h-12 w-12 rounded-lg bg-muted relative overflow-hidden flex-shrink-0">
                                  {item.sweet?.imageUrl && (
                                    <img src={item.sweet.imageUrl} alt={item.sweet.name} className="object-cover h-full w-full" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold">{item.sweet?.name || 'Unknown Sweet'}</p>
                                  <p className="text-sm text-muted-foreground">Qty: {item.quantity} x ₹{item.price}</p>
                                </div>
                              </div>
                              <p className="font-bold">₹{(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                          ))}
                          <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                            <span className="font-black text-xl">Total Amount</span>
                            <span className="text-primary font-black text-xl">₹{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass p-12 text-center border-dashed border-2">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-6">Looks like you haven't ordered any delicious sweets yet.</p>
                  <Button asChild variant="outline" className="rounded-xl">
                    <a href="/">Go to Shop</a>
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
