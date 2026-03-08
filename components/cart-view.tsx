'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, CartItem } from '@/lib/api'
import { getGuestCart, removeGuestCartItem, updateGuestCartItem, clearGuestCart } from '@/lib/guest-cart'
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
  const { user } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [guestCart, setGuestCart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setGuestCart(getGuestCart())
      setLoading(false)
    }
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

  // Merge guest cart to user cart after login
  useEffect(() => {
    if (user && guestCart.length > 0) {
      (async () => {
        for (const item of guestCart) {
          await api.addToCart(item.product.id, item.quantity)
        }
        clearGuestCart()
        setGuestCart([])
        fetchCart()
        window.dispatchEvent(new Event('cart-updated'))
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Sync guest cart to server after login
  useEffect(() => {
    if (user && guestCart.length > 0) {
      (async () => {
        for (const item of guestCart) {
          await api.addToCart(item.product.id, item.quantity)
        }
        clearGuestCart()
        setGuestCart([])
        fetchCart()
        window.dispatchEvent(new Event('cart-updated'))
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (user) {
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
    } else {
      updateGuestCartItem(itemId, quantity)
      setGuestCart(getGuestCart())
      window.dispatchEvent(new Event('cart-updated'))
      toast({
        title: 'Updated',
        description: 'Cart item quantity updated.',
      })
    }
  }

  const removeItem = async (itemId: number) => {
    if (user) {
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
    } else {
      removeGuestCartItem(itemId)
      setGuestCart(getGuestCart())
      window.dispatchEvent(new Event('cart-updated'))
      toast({
        title: 'Removed',
        description: 'Item removed from cart.',
      })
    }
  }

  const clearCart = async () => {
    if (user) {
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
    } else {
      clearGuestCart()
      setGuestCart([])
      window.dispatchEvent(new Event('cart-updated'))
      toast({
        title: 'Cleared',
        description: 'Cart cleared.',
      })
    }
  }

  const handleCheckout = async () => {
    if (!user) {
      // Guest checkout: build a temporary cart from guestCart
      if (!guestCart || guestCart.length === 0) {
        toast({
          title: 'Empty Cart',
          description: 'Please add items to your cart before checkout.',
          variant: 'destructive',
        })
        return
      }
      // Build a temporary cart object for the API
      const tempCart = {
        id: 0,
        items: guestCart.map((item: any, idx: number) => ({
          id: idx + 1,
          product: item.product,
          quantity: item.quantity,
          subtotal: parseFloat(item.product.price) * item.quantity,
        })),
        total: guestCart.reduce((sum: number, item: any) => sum + parseFloat(item.product.price) * item.quantity, 0),
      }
      try {
        const result = await api.checkout(tempCart, {
          id: 0,
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          profile: { phone: '', address: '' },
        })
        toast({
          title: 'Success',
          description: `Order placed! Invoice: ${result.invoice_number || result.id}`,
        })
        setCart(null)
        window.dispatchEvent(new Event('cart-updated'))
        // Store order in localStorage for thank you page
        if (typeof window !== 'undefined') {
          localStorage.setItem('last_order', JSON.stringify(result))
        }
        if (result.id) {
          router.push(`/order/success?invoice_id=${result.id}`)
        } else if (result.invoice_number) {
          router.push(`/order/success?invoice_number=${result.invoice_number}`)
        } else {
          router.push('/order/success')
        }
      } catch (err: any) {
        let errorMessage = 'Failed to checkout.'
        if (err.message) {
          try {
            const parsed = JSON.parse(err.message)
            if (typeof parsed === 'object') {
              errorMessage = Object.entries(parsed).map(([key, value]) => 
                `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
              ).join('\n')
            } else {
              errorMessage = err.message
            }
          } catch (e) {
            errorMessage = err.message
          }
        }
        toast({
          title: 'Checkout Failed',
          description: errorMessage,
          variant: 'destructive',
        })
      }
      return
    }
    // Logged-in user checkout
    if (!cart || cart.items.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before checkout.',
        variant: 'destructive',
      })
      return
    }
    try {
      const result = await api.checkout(cart, {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile: user.profile,
      })
      toast({
        title: 'Success',
        description: `Order placed! Invoice: ${result.invoice_number || result.id}`,
      })
      setCart(null)
      window.dispatchEvent(new Event('cart-updated'))
      // Store order in localStorage for thank you page
      if (typeof window !== 'undefined') {
        localStorage.setItem('last_order', JSON.stringify(result))
      }
      if (result.id) {
        router.push(`/order/success?invoice_id=${result.id}`)
      } else if (result.invoice_number) {
        router.push(`/order/success?invoice_number=${result.invoice_number}`)
      } else {
        router.push('/order/success')
      }
    } catch (err: any) {
      let errorMessage = 'Failed to checkout.'
      if (err.message) {
        try {
          const parsed = JSON.parse(err.message)
          if (typeof parsed === 'object') {
            errorMessage = Object.entries(parsed).map(([key, value]) => 
              `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
            ).join('\n')
          } else {
            errorMessage = err.message
          }
        } catch (e) {
          errorMessage = err.message
        }
      }
      toast({
        title: 'Checkout Failed',
        description: errorMessage,
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
    if (!user && guestCart.length > 0) {
      // Show guest cart
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            {guestCart.map((item) => (
              <Card key={item.product.id}>
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
                      {item.product.is_sold_by_weight ? (
                        <>
                          <p className="text-muted-foreground mb-2">
                            PKR {item.product.price} per gram
                          </p>
                          <p className="text-sm mb-2">
                            {item.quantity} grams × PKR {item.product.price} = PKR {(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="text-muted-foreground mb-2">
                          PKR {item.product.price} each
                        </p>
                      )}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {item.product.is_sold_by_weight ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, Math.max(0.1, Math.round((item.quantity - 0.1) * 10) / 10))}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                              const next = parseFloat(e.target.value)
                              updateQuantity(item.product.id, Number.isNaN(next) ? 0.1 : Math.max(0.1, next))
                              }}
                              className="w-28 text-center"
                              min="0.1"
                              step="0.1"
                              />
                              <span className="ml-2">grams</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, Math.round((item.quantity + 0.1) * 10) / 10)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                                className="w-20 text-center"
                                min="1"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        PKR {(parseFloat(item.product.price) * item.quantity).toFixed(2)}
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
                <span className="font-semibold">PKR {guestCart.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0).toFixed(2)}</span>
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
    // Default empty cart
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
                  {(item.product as any).is_sold_by_weight ? (
                    <>
                      <p className="text-muted-foreground mb-2">
                        PKR {item.product.price} per gram
                      </p>
                      <p className="text-sm mb-2">
                        {item.quantity} grams × PKR {item.product.price} = PKR {(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground mb-2">
                      PKR {item.product.price} each
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {(item.product as any).is_sold_by_weight ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.max(0.1, Math.round((item.quantity - 0.1) * 10) / 10))}
                            disabled={updating === item.id.toString()}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                          const next = parseFloat(e.target.value)
                          updateQuantity(item.id, Number.isNaN(next) ? 0.1 : Math.max(0.1, next))
                          }}
                          className="w-28 text-center"
                          min="0.1"
                          step="0.1"
                          disabled={updating === item.id.toString()}
                          />
                          <span className="ml-2">grams</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.round((item.quantity + 0.1) * 10) / 10)}
                            disabled={updating === item.id.toString()}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
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
