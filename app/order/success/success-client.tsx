"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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

export default function ClientSuccess() {
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

    ;(async () => {
      try {
        const orders = await api.getOrders()
        let found: InvoiceLike | undefined
        if (queryInvoiceId) {
          found = orders.find((o: any) => String(o.id) === String(queryInvoiceId))
        }
        if (!found && queryInvoiceNumber) {
          found = orders.find((o: any) => String(o.invoice_number) === String(queryInvoiceNumber))
        }
        if (found) setInvoice(found)
      } catch {}
      finally {
        setLoading(false)
      }
    })()
  }, [queryInvoiceId, queryInvoiceNumber])

  const handleDownload = () => {
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

  if (loading) return <div>Loading invoice...</div>

  if (!invoice) {
    return (
      <div className="space-y-3">
        {printableCss}
        <p className="text-muted-foreground">Your order was placed. Unable to load invoice details.</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/products')}>Continue Shopping</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {printableCss}
      <div id="invoice-print-area" ref={printRef}>
        <InvoiceView invoice={invoice} />
      </div>
      <div className="flex gap-3">
        <Button onClick={handleDownload}>Download PDF</Button>
        <Button variant="outline" onClick={() => router.push('/products')}>Continue Shopping</Button>
      </div>
    </div>
  )
}
