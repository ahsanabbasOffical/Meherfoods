import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductList } from '@/components/product-list'

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Our Products</h1>
          <ProductList categoryFilter={params.category} />
        </div>
      </main>
      <Footer />
    </div>
  )
}