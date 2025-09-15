'use client';

import { useState, useEffect } from 'react';
import { Menu, Search, Heart, ShoppingCart, User, Package, LogOut, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCartStore } from '@/store/cartStore';
import { SlideInCart } from './SlideInCart';
import Link from 'next/link';
import { isUserAuthenticated, getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { getTotalItems, openCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    // Function to check authentication status and get current user
    const checkAuth = () => {
      const authStatus = isUserAuthenticated();
      setIsAuth(authStatus);
      if (authStatus) {
        const user = getCurrentUser();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    };
    
    // Check authentication immediately
    checkAuth();
    
    // Set up event listeners for auth state changes
    const handleStorageChange = () => {
      checkAuth();
    };
    
    const handleAuthStateChange = () => {
      console.log('Auth state change event received');
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-state-changed', handleAuthStateChange);
    
    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
    };
  }, []);

  const handleLogout = () => {
    // Clear the auth token cookie
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Clear localStorage fallback
    localStorage.removeItem('auth-token');
    setIsAuth(false);
    setCurrentUser(null);
    router.push('/');
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+91')) {
      return `+91 ${phone.slice(3, 8)} ${phone.slice(8)}`;
    }
    return phone;
  };

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
                {isAuth && (
                  <>
                    <Link href="/my-orders" className="block py-2 hover:opacity-80 transition-colors" style={{ color: '#846549' }}>
                      My Orders
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block py-2 hover:opacity-80 transition-colors text-left w-full text-red-600"
                    >
                      Logout
                    </button>
                  </>
                )}
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
            {isAuth && (
              <Link href="/my-orders" className="hover:opacity-80 transition-colors flex items-center space-x-1" style={{ color: '#846549' }}>
                <Package className="h-4 w-4" />
                <span>My Orders</span>
              </Link>
            )}
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
            {isAuth && currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {currentUser.phoneNumber ? currentUser.phoneNumber.slice(-2) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">Account</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {formatPhoneNumber(currentUser.phoneNumber)}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-orders" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/addresses" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>Addresses</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="icon">
                  <User className="h-6 w-6" />
                </Button>
              </Link>
            )}
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