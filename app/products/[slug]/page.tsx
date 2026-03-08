import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductDetail } from '@/components/product-detail'
import { ProductAuthPopup } from '@/components/product-auth-popup'

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <ProductAuthPopup />
          <ProductDetail slug={slug} />
        </div>
      </main>
      <Footer />
    </div>
  )
}