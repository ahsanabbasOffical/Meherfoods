'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { User, Mail, Phone, MapPin, Heart, ShoppingCart } from 'lucide-react'
import { api, Invoice, Product, CartItem } from '@/lib/api'

export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
  })
  const [updating, setUpdating] = useState(false)
  const [orders, setOrders] = useState<Delivery[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartLoading, setCartLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
      })

      setOrdersLoading(true)
      api.getUserDeliveries().then(setOrders).catch(console.error).finally(() => setOrdersLoading(false))

      setWishlistLoading(true)
      api.getWishlist().then(setWishlist).catch(console.error).finally(() => setWishlistLoading(false))

      setCartLoading(true)
      api.getCart().then(data => setCart(data?.items || [])).catch(console.error).finally(() => setCartLoading(false))
    }
  }, [user, loading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const updatedUser = await updateProfile(formData)
      setFormData({
        first_name: updatedUser.first_name || '',
        last_name: updatedUser.last_name || '',
        phone: updatedUser.profile?.phone || '',
        address: updatedUser.profile?.address || '',
      })
      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            <div className="grid gap-6">
              {/* Profile Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                  <CardDescription>
                    Your account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Username</Label>
                      <p className="text-sm text-muted-foreground">{user.username}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Profile</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          type="text"
                          placeholder="First name"
                          value={formData.first_name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          type="text"
                          placeholder="Last name"
                          value={formData.last_name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Phone number"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Address
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="Your address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                    <Button type="submit" disabled={updating}>
                      {updating ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Order History */}
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>Your past orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div>Loading orders...</div>
                  ) : orders.length === 0 ? (
                    <p>No orders found.</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{order.order_name}</h4>
                            <span className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">Status: {order.status}</p>
                          <p className="text-sm">{order.product_name} x {order.quantity}</p>
                          <p className="font-semibold mt-2">Total: PKR {order.total_price}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Wishlist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Wishlist
                  </CardTitle>
                  <CardDescription>Your saved products</CardDescription>
                </CardHeader>
                <CardContent>
                  {wishlistLoading ? (
                    <div>Loading wishlist...</div>
                  ) : wishlist.length === 0 ? (
                    <p>No items in wishlist.</p>
                  ) : (
                    <div className="space-y-4">
                      {wishlist.map(product => (
                        <div key={product.id} className="border rounded-lg p-4 flex items-center gap-4">
                          <img src={product.images[0]?.image_url || 'https://via.placeholder.com/100x100?text=No+Image'} alt={product.name} className="w-16 h-16 object-cover rounded" />
                          <div className="flex-1">
                            <h4 className="font-semibold">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">{product.category_name}</p>
                            <p className="font-semibold">PKR {product.price}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/products/${product.slug}`)}>
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Cart
                  </CardTitle>
                  <CardDescription>Your current cart items</CardDescription>
                </CardHeader>
                <CardContent>
                  {cartLoading ? (
                    <div>Loading cart...</div>
                  ) : cart.length === 0 ? (
                    <p>No items in cart.</p>
                  ) : (
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="border rounded-lg p-4 flex items-center gap-4">
                          <img src={item.product.images[0]?.image_url || 'https://via.placeholder.com/100x100?text=No+Image'} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.product.name}</h4>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                            <p className="font-semibold">PKR {item.subtotal}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => router.push('/cart')}>
                            View Cart
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shopkeeper Dashboard Access */}
              {user?.username === 'shop_meher' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shopkeeper Dashboard</CardTitle>
                    <CardDescription>Access the shopkeeper management dashboard</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => router.push('/shopkeeper')}>
                      Go to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
