import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Order {
  id: number;
  customer_name: string;
  items: {
    product_name: string;
    quantity: number;
    total_price: string;
  }[];
  total_amount: string;
  status: string;
  created_at: string;
}

export default function ShopkeeperOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://sub.meherfoods.com/api'}/shop/orders/`, {
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError('Could not load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Shop Orders</h1>
      {orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>Order #{order.id} - {order.customer_name}</CardTitle>
                <div className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</div>
                <div className="text-sm">Status: <span className="font-semibold">{order.status}</span></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.product_name} x {item.quantity}</span>
                      <span>PKR {item.total_price}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="text-right font-bold">Total: PKR {order.total_amount}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
