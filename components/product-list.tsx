'use client'

import { useEffect, useState } from 'react'
import { api, Product } from '@/lib/api'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { Heart, ShoppingCart } from 'lucide-react'

interface ProductListProps {
  initialProducts?: Product[]
  categoryFilter?: string
}

export function ProductList({ initialProducts, categoryFilter }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [loading, setLoading] = useState(!initialProducts)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categoryFilter)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 })
  const { toast } = useToast()

  useEffect(() => {
    setSelectedCategory(categoryFilter)
  }, [categoryFilter])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const params: any = {
          min_price: priceRange.min,
          max_price: priceRange.max,
        }
        if (selectedCategory && selectedCategory !== 'all') {
          params.category = selectedCategory
        }
        if (searchTerm) {
          params.search = searchTerm
        }

        const [productsData, categoriesData] = await Promise.all([
          api.getProducts(params),
          api.getCategories(),
        ])
        setProducts(productsData)
        setCategories(categoriesData)
      } catch (err) {
        setError('Failed to load products')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedCategory, searchTerm, priceRange])

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

  const handleToggleWishlist = async (productId: number) => {
    try {
      await api.toggleWishlist(productId)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
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
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-background p-4 rounded-lg">
        <Select value={selectedCategory || 'all'} onValueChange={(value) => setSelectedCategory(value === 'all' ? undefined : value)}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64"
        />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Price: PKR {priceRange.min} - {priceRange.max}</span>
          {/* Simple price range - can be enhanced with sliders */}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 relative">
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <Image
                    src={product.images?.[0]?.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}
                    alt={product.name}
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
                    className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => handleToggleWishlist(product.id)}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg line-clamp-1">
                    {product.name}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {product.category_name}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 mb-3">
                  {product.description}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-primary">
                    PKR {product.price}
                  </p>
                  {product.in_stock && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToCart(product.id)}
                      className="gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link href={`/products/${product.slug}`}>
                    View Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
