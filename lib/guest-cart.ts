// Guest cart logic for not-logged-in users
// Stores cart in localStorage and provides add, remove, update, clear, and get methods

import type { Product } from './api'

export interface GuestCartItem {
  product: Product
  quantity: number
}

const STORAGE_KEY = 'guest_cart'

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function setGuestCart(cart: GuestCartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
}

export function addToGuestCart(product: Product, quantity: number = 1) {
  const cart = getGuestCart()
  const idx = cart.findIndex(item => item.product.id === product.id)
  if (idx !== -1) {
    cart[idx].quantity += quantity
  } else {
    cart.push({ product, quantity })
  }
  setGuestCart(cart)
}

export function updateGuestCartItem(productId: number, quantity: number) {
  const cart = getGuestCart()
  const idx = cart.findIndex(item => item.product.id === productId)
  if (idx !== -1) {
    cart[idx].quantity = quantity
    if (cart[idx].quantity <= 0) cart.splice(idx, 1)
    setGuestCart(cart)
  }
}

export function removeGuestCartItem(productId: number) {
  const cart = getGuestCart().filter(item => item.product.id !== productId)
  setGuestCart(cart)
}

export function clearGuestCart() {
  setGuestCart([])
}
