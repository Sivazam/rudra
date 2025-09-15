'use client';

import { useState } from 'react';
import { Menu, Search, Heart, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCartStore } from '@/store/cartStore';
import { SlideInCart } from './SlideInCart';
import Link from 'next/link';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { getTotalItems, openCart } = useCartStore();

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <nav className="space-y-4 mt-6">
                <Link href="/" className="block text-lg font-semibold text-orange-600">
                  Rudra Store
                </Link>
                <Link href="/categories" className="block py-2 text-gray-700 hover:text-orange-600">
                  Categories
                </Link>
                <Link href="/about" className="block py-2 text-gray-700 hover:text-orange-600">
                  About Us
                </Link>
                <Link href="/contact" className="block py-2 text-gray-700 hover:text-orange-600">
                  Contact
                </Link>
                <Link href="/auth/login" className="block py-2 text-gray-700 hover:text-orange-600">
                  Login
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">Rudra Store</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/categories" className="text-gray-700 hover:text-orange-600 transition-colors">
              Categories
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-600 transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-orange-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 w-64"
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Mobile Search */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-6 w-6" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Cart */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative" 
              onClick={openCart}
            >
              <ShoppingCart className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Button>

            {/* User Account */}
            <Button variant="ghost" size="icon">
              <User className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-10 w-full"
                onChange={(e) => onSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
    
    {/* Slide-in Cart */}
    <SlideInCart />
    </>
  );
}