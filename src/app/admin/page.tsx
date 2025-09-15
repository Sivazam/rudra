'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Tags, ShoppingCart, Users } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Total Products',
      value: '156',
      description: '+12% from last month',
      icon: Package,
    },
    {
      title: 'Categories',
      value: '8',
      description: '+2 new categories',
      icon: Tags,
    },
    {
      title: 'Total Orders',
      value: '1,234',
      description: '+18% from last month',
      icon: ShoppingCart,
    },
    {
      title: 'Customers',
      value: '892',
      description: '+25% from last month',
      icon: Users,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back to Rudra Admin Panel</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: '#1234', customer: 'John Doe', amount: '₹2,499', status: 'Delivered' },
                { id: '#1235', customer: 'Jane Smith', amount: '₹1,899', status: 'Processing' },
                { id: '#1236', customer: 'Bob Johnson', amount: '₹3,299', status: 'Shipped' },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.amount}</p>
                    <p className="text-sm text-green-600">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: '10 Mukhi Rudraksha', sales: 45, revenue: '₹67,455' },
                { name: '9 Mukhi Rudraksha', sales: 38, revenue: '₹56,962' },
                { name: '7 Mukhi Rudraksha', sales: 32, revenue: '₹47,968' },
              ].map((product) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}