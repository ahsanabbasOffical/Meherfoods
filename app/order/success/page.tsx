import { Suspense } from 'react'
import ClientSuccess from './success-client'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Order Successful</h1>
          <Suspense fallback={<div>Loading invoice...</div>}>
            <ClientSuccess />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
