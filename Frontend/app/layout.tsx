import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth/context"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Sweet Shop - Premium Indian Sweets Online",
  description:
    "India's #1 online sweet shop. Order authentic Indian sweets, mithai, and desserts. Fresh, premium quality delivered to your doorstep.",
  generator: "v0.app",
  icons: {
    icon: "/logo.png",
    apple: "/apple-icon.png",
  },
}

import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/lib/cart/context"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
