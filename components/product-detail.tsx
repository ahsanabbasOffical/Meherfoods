'use client'

import { useEffect, useState } from 'react'
import { api, Product } from '@/lib/api'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { Heart, ShoppingCart, Minus, Plus } from 'lucide-react'

interface ProductDetailProps {
  slug: string
}

export function ProductDetail({ slug }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const [productData, relatedData] = await Promise.all([
          api.getProduct(slug),
          api.getRelatedProducts(slug),
        ])
        setProduct(productData)
        setRelatedProducts(relatedData)
      } catch (err) {
        setError('Failed to load product')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  const handleAddToCart = async () => {
    if (!product) return

    try {
      await api.addToCart(product.id, quantity)
      toast({
        title: 'Added to Cart',
        description: `${quantity} x ${product.name} added to your cart.`,
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add to cart. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleToggleWishlist = async () => {
    if (!product) return

    try {
      await api.toggleWishlist(product.id)
      toast({
        title: 'Wishlist Updated',
        description: 'Product added/removed from wishlist.',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update wishlist.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Product not found'}</p>
        <Button asChild className="mt-4">
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Image
            src={product.images?.[0]?.image_url || 'https://via.placeholder.com/500x500?text=No+Image'}
            alt={product.images?.[0]?.alt_text || product.name}
            fill
            className="object-cover"
            priority
          />
          {!product.in_stock && (
            <Badge variant="destructive" className="absolute top-4 left-4">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{product.category_name}</Badge>
              {product.is_featured && (
                <Badge variant="default">Featured</Badge>
              )}
            </div>
            <p className="text-4xl font-bold text-primary mb-4">
              PKR {product.price}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <Separator />

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Quantity:</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                  min="1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="flex-1 gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleWishlist}
                className="gap-2"
              >
                <Heart className="h-4 w-4" />
                Wishlist
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    <Image
                      src={relatedProduct.images?.[0]?.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}
                      alt={relatedProduct.images?.[0]?.alt_text || relatedProduct.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    {relatedProduct.name}
                  </CardTitle>
                  <p className="text-xl font-bold text-primary">
                    PKR {relatedProduct.price}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button asChild className="w-full">
                    <Link href={`/products/${relatedProduct.slug}`}>
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
