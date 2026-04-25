"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { apiClient, type User } from "@/lib/api/client"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (token) {
      // Decode JWT to get user info (basic implementation)
      try {
        const parts = token.split(".")
        const payload = JSON.parse(atob(parts[1]))
        
        // Check expiration
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          apiClient.logout()
          setLoading(false)
          return
        }
        
        setUser({
          id: payload.id,
          email: payload.email,
          displayName: payload.displayName,
          isAdmin: payload.isAdmin || false,
        })
      } catch (e) {
        // Invalid token, clear it
        apiClient.logout()
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password)
    setUser(response.user)
  }

  const register = async (email: string, password: string, displayName?: string) => {
    const response = await apiClient.register(email, password, displayName)
    setUser(response.user)
  }

  const logout = () => {
    apiClient.logout()
    setUser(null)
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

