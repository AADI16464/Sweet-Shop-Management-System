"use client"

import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Wallet, IndianRupee } from "lucide-react"
import { useCart } from "@/lib/cart/context"
import { useAuth } from "@/lib/auth/context"
import { apiClient } from "@/lib/api/client"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

type RazorpaySuccessResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void
    }
  }
}

export function CartSheet() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("online")

  const loadRazorpayScript = async () => {
    if (typeof window === "undefined") return false
    if (window.Razorpay) return true

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const openRazorpay = (options: Record<string, unknown>) =>
    new Promise<RazorpaySuccessResponse>((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error("Razorpay checkout SDK not loaded"))
        return
      }

      const instance = new window.Razorpay({
        ...options,
        handler: (response: RazorpaySuccessResponse) => resolve(response),
      })
      instance.open()
    })

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to purchase items")
      return
    }

    if (items.length === 0) return

    setIsSubmitting(true)
    try {
      const cartItems = items.map((item) => ({
        sweetId: item.id,
        quantity: item.cartQuantity,
      }))

      if (paymentMethod === "cod") {
        await apiClient.createOrder({
          items: cartItems,
          paymentProvider: "COD",
          paymentReference: `COD_${Date.now()}`,
        })
        toast.success("Order placed with Cash on Delivery!")
        clearCart()
        setIsOpen(false)
        return
      }

      const paymentSession = await apiClient.createPaymentSession(totalPrice)

      if (paymentSession.provider === "RAZORPAY") {
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
          throw new Error("Unable to load Razorpay checkout")
        }

        if (!paymentSession.gatewayOrderId || !paymentSession.keyId) {
          throw new Error("Invalid payment session for Razorpay")
        }

        const result = await openRazorpay({
          key: paymentSession.keyId,
          amount: Math.round(totalPrice * 100),
          currency: paymentSession.currency,
          order_id: paymentSession.gatewayOrderId,
          name: "Sweet Shop",
          description: "Sweet order payment",
          theme: { color: "#ef4444" },
          method: {
            upi: true,
            card: true,
            netbanking: true,
            wallet: true,
          },
        })

        await apiClient.createOrder({
          items: cartItems,
          paymentReference: result.razorpay_payment_id,
          paymentProvider: "RAZORPAY",
          paymentMeta: {
            razorpayOrderId: result.razorpay_order_id,
            razorpayPaymentId: result.razorpay_payment_id,
            razorpaySignature: result.razorpay_signature,
          },
        })
      } else {
        await apiClient.createOrder({
          items: cartItems,
          paymentReference: paymentSession.sessionId,
          paymentProvider: paymentSession.provider,
        })
      }

      toast.success("Payment successful, order placed!")
      clearCart()
      setIsOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to place order")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative glass border-white/20 dark:border-white/10 rounded-xl hover:bg-primary/10">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-scale-in">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg glass border-l-white/20 dark:border-l-white/10">
        <SheetHeader className="px-6">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Your Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />
        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="flex flex-col gap-6 pr-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white/20 bg-muted">
                      <Image
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col self-start">
                      <span className="font-bold line-clamp-1">{item.name}</span>
                      <span className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</span>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.cartQuantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                          disabled={item.cartQuantity >= item.quantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold">₹{(item.price * item.cartQuantity).toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="px-6 space-y-4 pt-6 pb-8">
              <Separator />
              <div className="flex items-center justify-between font-black text-xl">
                <span>Total Amount</span>
                <span className="text-primary">₹{totalPrice.toFixed(2)}</span>
              </div>
              
              {isAuthenticated && (
                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-semibold text-foreground">Payment Method</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as "cod" | "online")}
                    className="flex gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="online" id="online" className="peer sr-only" />
                      <Label
                        htmlFor="online"
                        className="flex items-center gap-2 rounded-xl border-2 border-border/70 bg-card/90 px-4 py-3 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all hover:bg-accent"
                      >
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Pay Online</span>
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                      <Label
                        htmlFor="cod"
                        className="flex items-center gap-2 rounded-xl border-2 border-border/70 bg-card/90 px-4 py-3 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all hover:bg-accent"
                      >
                        <IndianRupee className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Cash on Delivery</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
               
              <Button 
                className="w-full h-12 text-lg font-bold rounded-2xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                onClick={handleCheckout}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : paymentMethod === "cod" ? (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    Order Now (Pay on Delivery)
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Place Order
                  </>
                )}
              </Button>
              {!isAuthenticated && (
                <p className="text-center text-xs text-muted-foreground">
                  Please sign in to complete your purchase
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-4 px-6 text-center">
            <div className="rounded-full bg-muted p-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="font-bold text-xl">Your cart is empty</h3>
            <p className="text-muted-foreground max-w-[240px]">
              Add some delicious Indian sweets to your cart and they'll show up here!
            </p>
            <Button variant="outline" className="rounded-xl mt-4" onClick={() => setIsOpen(false)}>
              Start Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
