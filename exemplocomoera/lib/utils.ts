import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${year}${random}`
}

// Re-export formatting utilities for convenience
export * from './utils/formatting'
