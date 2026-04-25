import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.svg"
  if (path.startsWith("http") || path.startsWith("data:")) return path
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001"
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`
}
