"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { InvoiceView } from '@/components/invoice-view'
import { api } from '@/lib/api'

interface InvoiceLike {
  id?: number
  invoice_number?: string
  deliveries?: any[]
  total_amount?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  customer_address?: string
  created_at?: string
}

export default function OrderSuccessPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<InvoiceLike | null>(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  const queryInvoiceId = sp.get('invoice_id')
  const queryInvoiceNumber = sp.get('invoice_number')

  // Try to read from localStorage first (set by CartView), then fall back to fetching
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('last_order') : null
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setInvoice(parsed)
        setLoading(false)
        return
      } catch {}
    }

    // Fallback: attempt to fetch user's orders and find matching one
    (async () => {
      try {
        const orders = await api.getOrders()
        let found: InvoiceLike | undefined
        if (queryInvoiceId) {
          found = orders.find((o: any) => String(o.id) === String(queryInvoiceId))
        }
        if (!found && queryInvoiceNumber) {
          found = orders.find((o: any) => String(o.invoice_number) === String(queryInvoiceNumber))
        }
        if (found) {
          setInvoice(found)
        }
      } catch (e) {
        // ignore fetch error; we still render a generic success state
      } finally {
        setLoading(false)
      }
    })()
  }, [queryInvoiceId, queryInvoiceNumber])

  const handleDownload = () => {
    // Use the browser's print dialog. User can select "Save as PDF" to generate a PDF without extra deps.
    // We ensure only the invoice section is printed with CSS.
    window.print()
  }

  const printableCss = useMemo(() => (
    <style>{`
      @media print {
        body * { visibility: hidden; }
        #invoice-print-area, #invoice-print-area * { visibility: visible; }
        #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; }
      }
    `}</style>
  ), [])

  return (
    <div className="min-h-screen flex flex-col">
      {printableCss}
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Order Successful</h1>

          {loading ? (
            <div>Loading invoice...</div>
          ) : invoice ? (
            <div className="space-y-4">
              <div id="invoice-print-area" ref={printRef}>
                <InvoiceView invoice={invoice} />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleDownload}>Download PDF</Button>
                <Button variant="outline" onClick={() => router.push('/products')}>Continue Shopping</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground">Your order was placed. Unable to load invoice details.</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push('/products')}>Continue Shopping</Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
