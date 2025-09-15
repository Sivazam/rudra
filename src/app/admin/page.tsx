"use client";

import {
	AlertCircle,
	DollarSign,
	FileText,
	Package,
	ShoppingCart,
	Tag,
	TrendingUp,
	Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/shadcn/card";

const stats = [
	{
		name: "Total Products",
		value: "156",
		change: "+12%",
		changeType: "positive" as const,
		icon: Package,
	},
	{
		name: "Total Orders",
		value: "1,234",
		change: "+8%",
		changeType: "positive" as const,
		icon: ShoppingCart,
	},
	{
		name: "Total Revenue",
		value: "₹2,45,678",
		change: "+15%",
		changeType: "positive" as const,
		icon: DollarSign,
	},
	{
		name: "Active Customers",
		value: "892",
		change: "+5%",
		changeType: "positive" as const,
		icon: Users,
	},
];

const recentOrders = [
	{
		id: "ORD-001",
		customer: "Rajesh Kumar",
		amount: "₹1,499",
		status: "delivered",
		date: "2024-01-15",
	},
	{
		id: "ORD-002",
		customer: "Priya Sharma",
		amount: "₹2,999",
		status: "pending",
		date: "2024-01-15",
	},
	{
		id: "ORD-003",
		customer: "Amit Patel",
		amount: "₹899",
		status: "paid",
		date: "2024-01-14",
	},
];

const lowStockProducts = [
	{
		name: "10 Mukhi Rudraksha",
		stock: 3,
		sku: "RK10-001",
	},
	{
		name: "9 Mukhi Rudraksha",
		stock: 5,
		sku: "RK09-001",
	},
	{
		name: "Sphatik Mala",
		stock: 2,
		sku: "SP-001",
	},
];

export default function AdminDashboard() {
	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
				<p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your store today.</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{stats.map((stat) => (
					<Card key={stat.name}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-gray-600">{stat.name}</CardTitle>
							<stat.icon className="h-4 w-4 text-orange-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className="text-xs text-green-600 flex items-center mt-1">
								<TrendingUp className="h-3 w-3 mr-1" />
								{stat.change} from last month
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Orders */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<FileText className="h-5 w-5 mr-2" />
							Recent Orders
						</CardTitle>
						<CardDescription>Latest orders from your customers</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{recentOrders.map((order) => (
								<div key={order.id} className="flex items-center justify-between">
									<div>
										<p className="font-medium">{order.id}</p>
										<p className="text-sm text-gray-600">{order.customer}</p>
									</div>
									<div className="text-right">
										<p className="font-medium">{order.amount}</p>
										<p className="text-sm text-gray-600">{order.date}</p>
									</div>
									<div
										className={`px-2 py-1 rounded-full text-xs font-medium ${
											order.status === "delivered"
												? "bg-green-100 text-green-800"
												: order.status === "pending"
													? "bg-yellow-100 text-yellow-800"
													: "bg-blue-100 text-blue-800"
										}`}
									>
										{order.status}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Low Stock Alerts */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<AlertCircle className="h-5 w-5 mr-2" />
							Low Stock Alerts
						</CardTitle>
						<CardDescription>Products that need restocking</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{lowStockProducts.map((product) => (
								<div key={product.sku} className="flex items-center justify-between">
									<div>
										<p className="font-medium">{product.name}</p>
										<p className="text-sm text-gray-600">SKU: {product.sku}</p>
									</div>
									<div className="text-right">
										<p className={`font-medium ${product.stock <= 3 ? "text-red-600" : "text-orange-600"}`}>
											{product.stock} left
										</p>
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
