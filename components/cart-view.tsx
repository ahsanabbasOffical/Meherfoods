'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, CartItem } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'

interface Cart {
  id: number
  items: CartItem[]
  total: number
}

export function CartView() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const cartData = await api.getCart()
      setCart(cartData)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load cart.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }

    setUpdating(itemId.toString())
    try {
      const updatedCart = await api.updateCartItem(itemId, quantity)
      setCart(updatedCart)
      toast({
        title: 'Updated',
        description: 'Cart item quantity updated.',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update quantity.',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: number) => {
    setUpdating(itemId.toString())
    try {
      const updatedCart = await api.removeCartItem(itemId)
      setCart(updatedCart)
      toast({
        title: 'Removed',
        description: 'Item removed from cart.',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to remove item.',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  const clearCart = async () => {
    try {
      const updatedCart = await api.clearCart()
      setCart(updatedCart)
      toast({
        title: 'Cleared',
        description: 'Cart cleared.',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to clear cart.',
        variant: 'destructive',
      })
    }
  }

  const handleCheckout = async () => {
    try {
      const result = await api.checkout()
      toast({
        title: 'Success',
        description: `Order placed! Invoice: ${result.invoice_number}`,
      })
      setCart(null) // Clear cart after successful checkout
      router.push('/') // Redirect to home
    } catch (err: any) {
      toast({
        title: 'Checkout Failed',
        description: err.message || 'Failed to checkout.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some products to get started!</p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <div className="space-y-4">
        {cart.items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={item.product.images[0]?.image_url || 'https://via.placeholder.com/100x100?text=No+Image'}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    <Link href={`/products/${item.product.slug}`} className="hover:text-primary">
                      {item.product.name}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    PKR {item.product.price} each
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id.toString()}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-20 text-center"
                        min="1"
                        disabled={updating === item.id.toString()}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id.toString()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={updating === item.id.toString()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    PKR {item.subtotal}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cart Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Cart Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-lg">
            <span>Total:</span>
            <span className="font-semibold">PKR {cart.total}</span>
          </div>
          <Separator />
          <div className="flex gap-3">
            <Button variant="outline" onClick={clearCart} className="flex-1">
              Clear Cart
            </Button>
            <Button onClick={handleCheckout} className="flex-1">
              Checkout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
