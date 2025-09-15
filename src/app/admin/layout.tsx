"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/shadcn/button";
import { Sheet, SheetContent, SheetTrigger } from "@/ui/shadcn/sheet";
import { 
  Package, 
  ShoppingCart, 
  Tag, 
  Users, 
  Settings, 
  Menu,
  Home,
  Percent,
  FileText
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Categories", href: "/admin/categories", icon: Package },
  { name: "Products", href: "/admin/products", icon: ShoppingCart },
  { name: "Variants", href: "/admin/variants", icon: Tag },
  { name: "Discounts", href: "/admin/discounts", icon: Percent },
  { name: "Orders", href: "/admin/orders", icon: FileText },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn(
      "flex flex-col h-full bg-orange-50 border-r border-orange-200",
      mobile && "w-64"
    )}>
      <div className="flex items-center justify-center h-16 px-4 border-b border-orange-200">
        <h1 className="text-xl font-bold text-orange-800">
          Sanathan Admin
        </h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-orange-100 text-orange-800 border-r-2 border-orange-600"
                  : "text-orange-700 hover:bg-orange-100 hover:text-orange-800"
              )}
              onClick={() => mobile && setSidebarOpen(false)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-orange-200">
        <Button 
          variant="outline" 
          className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
          asChild
        >
          <Link href="/">View Store</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          <div></div> {/* Spacer */}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}