"use client"

import React, { forwardRef } from 'react'

interface DeliveryItem {
  id: number
  product?: number
  product_name?: string
  quantity: number
  total_price: string
}

interface InvoiceData {
  id?: number
  invoice_number?: string
  deliveries?: DeliveryItem[]
  total_amount?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  customer_address?: string
  created_at?: string
}

// Printable invoice view
export const InvoiceView = forwardRef<HTMLDivElement, { invoice: InvoiceData }>(
  ({ invoice }, ref) => {
    const number = invoice.invoice_number || invoice.id || 'N/A'
    const date = invoice.created_at ? new Date(invoice.created_at).toLocaleString() : new Date().toLocaleString()

    const items = (invoice.deliveries || []).map((d) => ({
      id: d.id,
      name: d.product_name || `Product #${d.product}`,
      quantity: d.quantity,
      total: d.total_price,
    }))

    // Fallback total if not provided
    const total = invoice.total_amount || (
      items.length > 0
        ? items
            .map((i) => parseFloat(String(i.total) || '0'))
            .reduce((a, b) => a + b, 0)
            .toFixed(2)
        : '0.00'
    )

    return (
      <div ref={ref as any} className="bg-white text-black p-6 rounded-md border shadow-sm max-w-3xl mx-auto">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-3">
            <img src="/meher.webp" alt="Meher Foods" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-bold">Meher Foods</h1>
              <p className="text-xs text-gray-600">Premium Spices & Foods</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">Invoice</div>
            <div className="text-sm">No: {number}</div>
            <div className="text-sm">Date: {date}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h2 className="font-semibold mb-1">Billed To</h2>
            <div className="text-sm">
              <div>{invoice.customer_name || 'N/A'}</div>
              <div>{invoice.customer_email || ''}</div>
              <div>{invoice.customer_phone || ''}</div>
              <div className="whitespace-pre-wrap">{invoice.customer_address || ''}</div>
            </div>
          </div>
          <div>
            <h2 className="font-semibold mb-1">From</h2>
            <div className="text-sm">
              <div>Meher Foods</div>
              <div>support@meherfoods.com</div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2 border-b">#</th>
                <th className="text-left p-2 border-b">Item</th>
                <th className="text-right p-2 border-b">Qty</th>
                <th className="text-right p-2 border-b">Total (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-gray-500">No items</td>
                </tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={it.id || idx} className="odd:bg-white even:bg-gray-50">
                    <td className="p-2 border-b">{idx + 1}</td>
                    <td className="p-2 border-b">{it.name}</td>
                    <td className="p-2 border-b text-right">{it.quantity}</td>
                    <td className="p-2 border-b text-right">{it.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <div className="min-w-[240px]">
            <div className="flex justify-between py-1 text-sm">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">PKR {total}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Thank you for your purchase!
        </div>
      </div>
    )
  }
)

InvoiceView.displayName = 'InvoiceView'
