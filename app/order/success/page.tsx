'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle, Package, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  product_name: string;
  quantity: number;
  total_price: string;
}

interface OrderDetails {
  id: number;
  invoice_number: string;
  deliveries: OrderItem[];
  total_amount: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  status: string;
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://sub.meherfoods.com/api';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const invoiceId = searchParams.get('invoice_id');
  const invoiceNumber = searchParams.get('invoice_number');

  useEffect(() => {
    if (invoiceId) {
      fetchOrderDetails(invoiceId);
    } else if (invoiceNumber) {
      // If we have invoice number but not ID, fetch recent orders
      fetchOrderByNumber(invoiceNumber);
    } else {
      setError('No order information available');
      setLoading(false);
    }
  }, [invoiceId, invoiceNumber]);

  const fetchOrderDetails = async (id: string) => {
    const token = localStorage.getItem('auth_token');
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/invoices/${id}/`, {
        headers: token ? { Authorization: `Token ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        setError('Failed to load order details');
      }
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderByNumber = async (invoiceNumber: string) => {
    const token = localStorage.getItem('auth_token');
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/invoices/`, {
        headers: token ? { Authorization: `Token ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        const foundOrder = data.find((o: OrderDetails) => o.invoice_number === invoiceNumber);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found');
        }
      } else {
        setError('Failed to load order details');
      }
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center text-red-500">Unable to Load Order</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">{error || 'Something went wrong'}</p>
              <Button asChild>
                <Link href="/">Go to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Success Message */}
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <h1 className="text-3xl font-bold text-green-800">Thank You for Your Order!</h1>
              </div>
              <p className="text-center text-green-700">
                Your order has been placed successfully. We will process it soon!
              </p>
            </CardContent>
          </Card>

          {/* Order Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Order Details</CardTitle>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Invoice:</span> {order.invoice_number}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-medium">#{order.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{order.customer_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{order.customer_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Delivery Address */}
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{order.customer_address}</p>
                </div>
              </div>

              <Separator />

              {/* Products Table */}
              <div>
                <h3 className="font-semibold mb-3">Products Ordered</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.deliveries?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">PKR {item.total_price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Total Amount</h3>
                <p className="text-2xl font-bold">PKR {order.total_amount}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button asChild className="flex-1">
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/profile">View My Orders</Link>
            </Button>
          </div>

          {/* Contact Info */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <p className="text-blue-800 font-medium mb-2">Need Help?</p>
              <p className="text-blue-700 text-sm">
                If you have any questions about your order, please contact us at{' '}
                <span className="font-semibold">contact@meherfoods.com</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
