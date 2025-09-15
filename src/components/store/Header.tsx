'use client';

import { useState, useEffect } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);
  const { getTotalItems, openCart } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
                <Link href="/" className="block text-lg font-semibold" style={{ color: 'rgba(156,86,26,255)' }}>
                  Rudra Store
                </Link>
                <Link href="/categories" className="block py-2 hover:opacity-80 transition-colors" style={{ color: '#846549' }}>
                  Categories
                </Link>
                <Link href="/about" className="block py-2 hover:opacity-80 transition-colors" style={{ color: '#846549' }}>
                  About Us
                </Link>
                <Link href="/contact" className="block py-2 hover:opacity-80 transition-colors" style={{ color: '#846549' }}>
                  Contact
                </Link>
                <Link href="/auth/login" className="block py-2 hover:opacity-80 transition-colors" style={{ color: '#846549' }}>
                  Login
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(156,86,26,255)' }}>
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold hidden sm:block" style={{ color: '#755e3e' }}>Rudra Store</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/categories" className="hover:opacity-80 transition-colors" style={{ color: '#846549' }}>
              Categories
            </Link>
            <Link href="/about" className="hover:opacity-80 transition-colors" style={{ color: '#846549' }}>
              About Us
            </Link>
            <Link href="/contact" className="hover:opacity-80 transition-colors" style={{ color: '#846549' }}>
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
              <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: 'rgba(156,86,26,255)' }}>
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
              {isMounted && getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: 'rgba(156,86,26,255)' }}>
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