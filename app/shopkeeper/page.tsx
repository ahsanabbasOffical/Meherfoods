'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://sub.meherfoods.com/api';

interface Delivery {
  id: number;
  order_name: string;
  product: number;
  product_name: string;
  quantity: number;
  total_price: string;
  address_snapshot: string;
  status: string;
  created_at: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  deliveries: Delivery[];
  total_amount: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  status: string;
  created_at: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export default function ShopkeeperDashboard() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [lastSeenInvoiceId, setLastSeenInvoiceId] = useState<number | null>(null);
  const [showNewOrderDialog, setShowNewOrderDialog] = useState<Invoice | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      router.push('/shopkeeper/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.username !== 'shop_meher') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/shopkeeper/login');
      return;
    }

    fetchData(token);
  }, [router]);

  // Poll for new invoices every 20 seconds and show a popup when a new one arrives
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let abort = false;
    let timer: any;
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/invoices/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!res.ok) return;
        const data: Invoice[] = await res.json();
        if (abort) return;
        setInvoices(data);
        if (data.length > 0) {
          const latest = data[0];
          if (lastSeenInvoiceId === null) {
            setLastSeenInvoiceId(latest.id);
          } else if (latest.id !== lastSeenInvoiceId) {
            setLastSeenInvoiceId(latest.id);
            setShowNewOrderDialog(latest);
            toast({ title: 'New order received', description: `Invoice ${latest.invoice_number || latest.id}` });
          }
        }
      } catch {}
      finally {
        if (!abort) timer = setTimeout(poll, 20000);
      }
    };

    poll();
    return () => { abort = true; clearTimeout(timer); };
  }, [lastSeenInvoiceId, toast]);

  const fetchData = async (token: string) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDeliveries(token),
        fetchInvoices(token),
        fetchUsers(token),
      ]);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async (token: string) => {
    const response = await fetch(`${API_BASE}/deliveries/`, {
      headers: { Authorization: `Token ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      setDeliveries(data);
    } else if (response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/shopkeeper/login');
    } else {
      setError('Failed to fetch orders');
    }
  };

  const fetchInvoices = async (token: string) => {
    const response = await fetch(`${API_BASE}/invoices/`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setInvoices(data);
    }
  };

  const fetchUsers = async (token: string) => {
    const response = await fetch(`${API_BASE}/users/`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setUsers(data);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setUpdating(id);
    try {
      const response = await fetch(`${API_BASE}/deliveries/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
        toast({ title: 'Status updated', description: `Order ${id} updated to ${newStatus}.` });
      } else {
        toast({ variant: 'destructive', title: 'Update failed', description: 'Please try again.' });
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Network error', description: 'Update failed.' });
    } finally {
      setUpdating(null);
    }
  };

  const viewOrderDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const closeOrderDetails = () => {
    setSelectedInvoice(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/shopkeeper/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-7xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shopkeeper Dashboard</CardTitle>
          <Button onClick={handleLogout}>Logout</Button>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Tabs defaultValue="deliveries" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            <TabsContent value="deliveries">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Total (PKR)</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>{delivery.id}</TableCell>
                      <TableCell>{delivery.order_name}</TableCell>
                      <TableCell>{delivery.product_name}</TableCell>
                      <TableCell>{delivery.quantity}</TableCell>
                      <TableCell>{delivery.total_price}</TableCell>
                      <TableCell className="max-w-xs truncate">{delivery.address_snapshot}</TableCell>
                      <TableCell>{delivery.status}</TableCell>
                      <TableCell>
                        <Select value={delivery.status} onValueChange={(value) => updateStatus(delivery.id, value)}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                          </SelectContent>
                        </Select>
                        {updating === delivery.id && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      </TableCell>
                    </TableRow>
                  ))}
                  {deliveries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">No deliveries found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="invoices">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.customer_name}</TableCell>
                      <TableCell>{invoice.deliveries?.length || 0} item(s)</TableCell>
                      <TableCell>{invoice.total_amount}</TableCell>
                      <TableCell>{invoice.status}</TableCell>
                      <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => viewOrderDetails(invoice)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {invoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">No invoices found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="users">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.first_name} {user.last_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Order Details Dialog - Shows all products in an invoice */}
      <Dialog open={!!selectedInvoice} onOpenChange={closeOrderDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedInvoice?.invoice_number}</DialogTitle>
            <DialogDescription>Complete information about this order including all products</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                  <p className="text-lg font-semibold">{selectedInvoice.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer Email</label>
                  <p className="text-lg">{selectedInvoice.customer_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-lg">{selectedInvoice.customer_phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-lg font-semibold capitalize">{selectedInvoice.status}</p>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Delivery Address</label>
                <p className="text-lg">{selectedInvoice.customer_address}</p>
              </div>

              {/* Products Table */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Products Ordered</label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.deliveries?.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">{delivery.product_name}</TableCell>
                        <TableCell>{delivery.quantity}</TableCell>
                        <TableCell>PKR {delivery.total_price}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            delivery.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {delivery.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <label className="text-lg font-medium">Total Amount</label>
                  <p className="text-2xl font-bold">PKR {selectedInvoice.total_amount}</p>
                </div>
              </div>

              {/* Order Date */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                <p className="text-lg">{new Date(selectedInvoice.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Order Dialog */}
      <Dialog open={!!showNewOrderDialog} onOpenChange={() => setShowNewOrderDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Order Received</DialogTitle>
            <DialogDescription>A new order has been placed.</DialogDescription>
          </DialogHeader>
          {showNewOrderDialog && (
            <div className="space-y-3">
              <div className="text-sm">Invoice: <span className="font-semibold">{showNewOrderDialog.invoice_number || showNewOrderDialog.id}</span></div>
              <div className="text-sm">Customer: {showNewOrderDialog.customer_name}</div>
              <div className="text-sm">Items: {showNewOrderDialog.deliveries?.length || 0}</div>
              <div className="text-sm">Total: PKR {showNewOrderDialog.total_amount}</div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={() => setShowNewOrderDialog(null)}>Dismiss</Button>
                <Button onClick={() => { setSelectedInvoice(showNewOrderDialog); setShowNewOrderDialog(null); }}>View</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
