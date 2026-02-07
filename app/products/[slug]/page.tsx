import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductDetail } from '@/components/product-detail'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <ProductDetail slug={slug} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
