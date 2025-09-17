'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Users, ShoppingCart, TrendingUp, Settings, Database, BarChart3, FileText } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin control panel</p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          System Active
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Active products in store</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Orders processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0</div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Category Management
            </CardTitle>
            <CardDescription>
              Manage product categories, add new categories with images and details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin-dashboard/categories">
              <Button className="w-full" variant="outline">
                View All Categories
              </Button>
            </Link>
            <Link href="/admin-dashboard/categories/new">
              <Button className="w-full">
                Add New Category
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Management
            </CardTitle>
            <CardDescription>
              Manage your product catalog, add new products with variants and discounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin-dashboard/products">
              <Button className="w-full" variant="outline">
                View All Products
              </Button>
            </Link>
            <Link href="/admin-dashboard/products/new">
              <Button className="w-full">
                Add New Product
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Management
            </CardTitle>
            <CardDescription>
              View and manage customer orders, process payments, and track shipments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/my-orders">
              <Button className="w-full" variant="outline">
                View All Orders
              </Button>
            </Link>
            <Button className="w-full" variant="outline" disabled>
              Process Orders (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Management
            </CardTitle>
            <CardDescription>
              Manage customer accounts, view profiles, and handle support requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline" disabled>
              View Customers (Coming Soon)
            </Button>
            <Button className="w-full" variant="outline" disabled>
              Customer Support (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics & Reports
            </CardTitle>
            <CardDescription>
              View sales analytics, generate reports, and track business performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline" disabled>
              Sales Report (Coming Soon)
            </Button>
            <Button className="w-full" variant="outline" disabled>
              Analytics Dashboard (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Store Settings
            </CardTitle>
            <CardDescription>
              Configure store settings, payment methods, and shipping options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline" disabled>
              General Settings (Coming Soon)
            </Button>
            <Button className="w-full" variant="outline" disabled>
              Payment Settings (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Management
            </CardTitle>
            <CardDescription>
              Manage database, backup data, and monitor system performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/debug">
              <Button className="w-full" variant="outline">
                System Debug
              </Button>
            </Link>
            <Button className="w-full" variant="outline" disabled>
              Database Backup (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest system activities and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">System initialized successfully</p>
                <p className="text-xs text-gray-500">Just now</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Admin dashboard created</p>
                <p className="text-xs text-gray-500">Just now</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Product snapshot system activated</p>
                <p className="text-xs text-gray-500">Recently</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}