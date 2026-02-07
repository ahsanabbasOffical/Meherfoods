'use client'

import { useEffect, useState } from 'react'
import { api, Product } from '@/lib/api'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'

export function WishlistView() {
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const data = await api.getWishlist()
      setWishlist(data)
    } catch (err) {
      setError('Failed to load wishlist')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: number) => {
    try {
      await api.addToCart(productId, 1)
      toast({
        title: 'Added to Cart',
        description: 'Product added to your shopping cart.',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add to cart. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await api.toggleWishlist(productId)
      setWishlist(prev => prev.filter(p => p.id !== productId))
      toast({
        title: 'Removed',
        description: 'Product removed from wishlist.',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to remove from wishlist.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-48 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchWishlist} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-6">Add some products to your wishlist!</p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {wishlist.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-shadow">
          <CardHeader className="p-0 relative">
            <div className="relative aspect-square overflow-hidden rounded-t-lg">
              <Image
                src={product.images?.[0]?.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}
                alt={product.images?.[0]?.alt_text || product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
              {!product.in_stock && (
                <Badge variant="destructive" className="absolute top-2 left-2">
                  Out of Stock
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 rounded-full p-0 bg-white/80 hover:bg-white"
                onClick={() => handleRemoveFromWishlist(product.id)}
              >
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="text-lg mb-2 line-clamp-2">
              {product.name}
            </CardTitle>
            <CardDescription className="line-clamp-2 mb-2">
              {product.description}
            </CardDescription>
            <p className="text-2xl font-bold text-primary">
              PKR {product.price}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex gap-2">
            <Button asChild className="flex-1">
              <Link href={`/products/${product.slug}`}>
                View Details
              </Link>
            </Button>
            {product.in_stock && (
              <Button
                variant="outline"
                onClick={() => handleAddToCart(product.id)}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
