"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import type { Sweet } from "@/lib/api/client"

export interface CartItem extends Sweet {
  cartQuantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (sweet: Sweet, quantity: number) => void
  removeItem: (sweetId: string) => void
  updateQuantity: (sweetId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error("Failed to parse cart", e)
      }
    }
  }, [])

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  const addItem = (sweet: Sweet, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === sweet.id)
      if (existing) {
        return prev.map((item) =>
          item.id === sweet.id
            ? { ...item, cartQuantity: item.cartQuantity + quantity }
            : item
        )
      }
      return [...prev, { ...sweet, cartQuantity: quantity }]
    })
  }

  const removeItem = (sweetId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== sweetId))
  }

  const updateQuantity = (sweetId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(sweetId)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === sweetId ? { ...item, cartQuantity: Math.min(quantity, item.quantity) } : item
      )
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, item) => sum + item.cartQuantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.cartQuantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}
