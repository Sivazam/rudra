// Example implementation for customer orders polling
// This would be added to the customer's orders page

import { useEffect, useState } from 'react';
import { orderService } from '@/lib/services/orderService';

export default function CustomerOrdersPolling() {
  const [orders, setOrders] = useState([]);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userOrders = await orderService.getOrdersByUserId('CURRENT_USER_ID'); // Replace with actual user ID
        setOrders(userOrders);
        
        // Check for recent updates
        const latestUpdate = Math.max(...userOrders.map(order => 
          new Date(order.updatedAt?.seconds || order.createdAt?.seconds || 0).getTime()
        ));
        
        if (lastUpdate && latestUpdate > lastUpdate) {
          setLastUpdate(latestUpdate);
          // Show notification or refresh UI
          console.log('Orders updated since last check');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    // Poll every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <h3>Customer Orders Polling Component</h3>
      <p>This component would poll for order updates every 30 seconds</p>
      <p>Last update: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Never'}</p>
      <div>
        {orders.map(order => (
          <div key={order.id} className="border p-4 mb-4">
            <h4>Order {order.orderNumber}</h4>
            <p>Status: {order.status}</p>
            <p>Updated: {new Date(order.updatedAt?.seconds || order.createdAt?.seconds || 0).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}