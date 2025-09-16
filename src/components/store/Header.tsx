'use client';

import { useState, useEffect } from 'react';
import { Menu, Search, Heart, ShoppingCart, User, Package, LogOut, Phone, MapPin, Edit, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCartStore } from '@/store/cartStore';
import { SlideInCart } from './SlideInCart';
import Link from 'next/link';
import { isUserAuthenticated, getCurrentUser } from '@/lib/auth';
import { isProfileComplete, getCurrentUserProfile } from '@/lib/profileCompletionMiddleware';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const { getTotalItems, openCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    // Function to check authentication status and get current user
    const checkAuth = async () => {
      const authStatus = isUserAuthenticated();
      setIsAuth(authStatus);
      if (authStatus) {
        const user = getCurrentUser();
        setCurrentUser(user);
        
        // Check profile completion
        try {
          setIsCheckingProfile(true);
          const profileComplete = await isProfileComplete();
          console.log('Profile completion check result:', profileComplete);
          setIsProfileComplete(profileComplete);
        } catch (error) {
          console.error('Error checking profile completion:', error);
          setIsProfileComplete(false);
        } finally {
          setIsCheckingProfile(false);
        }
      } else {
        setCurrentUser(null);
        setIsProfileComplete(null);
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
      // Add a small delay to ensure Firestore updates are committed
      setTimeout(() => {
        checkAuth();
      }, 500);
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
            <SheetContent side="left" className="w-64 bg-white">
              <nav className="space-y-6 mt-6 px-4">
                <Link href="/" className="block text-lg font-semibold text-black">
                  Rudra Store
                </Link>
                
                {/* User Information Section - Only show if authenticated */}
                {isAuth && currentUser && (
                  <div className="space-y-4">
                    {/* Profile Completion Warning - Only show if profile is incomplete and not loading */}
                    {!isCheckingProfile && isProfileComplete === false && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-orange-800">Complete Your Profile</p>
                            <p className="text-xs text-orange-600">Please add your name and email</p>
                          </div>
                        </div>
                        <Link href="/auth/complete-profile" className="block mt-2">
                          <Button 
                            className="w-full text-xs py-1.5" 
                            style={{ backgroundColor: 'rgba(156,86,26,255)', color: 'white' }}
                          >
                            Complete Now
                          </Button>
                        </Link>
                      </div>
                    )}
                    
                    {/* Loading indicator for profile check */}
                    {isCheckingProfile && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          <span className="ml-2 text-xs text-gray-600">Checking profile...</span>
                        </div>
                      </div>
                    )}
                    
                    {/* User Details Row */}
                    <div className="flex items-start space-x-3">
                      {/* Left Column - Avatar */}
                      <Avatar className="h-14 w-14 flex-shrink-0">
                        <AvatarFallback className="bg-orange-100 text-orange-600 text-sm">
                          {currentUser.phoneNumber ? currentUser.phoneNumber.slice(-2) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Right Column - User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-black">
                          {currentUser.name || 'User'}
                        </p>
                        {currentUser.email && (
                          <p className="text-xs text-gray-600 mt-1">
                            {currentUser.email}
                          </p>
                        )}
                        {currentUser.phoneNumber && (
                          <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
                            <Phone className="h-3 w-3" style={{ color: '#846549' }} />
                            <span>{formatPhoneNumber(currentUser.phoneNumber)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Edit Profile Button - Much Smaller */}
                    <Link href="/profile" className="block">
                      <Button 
                        className="w-full text-xs py-1.5" 
                        style={{ backgroundColor: 'rgba(156,86,26,255)', color: 'white' }}
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                )}
                
                {/* User-specific menu items - Only show if authenticated */}
                {isAuth && (
                  <div className="space-y-1">
                    <div className="border-b border-gray-200"></div>
                    <Link href="/addresses" className="block py-3 hover:opacity-80 transition-colors flex items-center space-x-3 text-black">
                      <MapPin className="h-4 w-4" style={{ color: '#846549' }} />
                      <span>Addresses</span>
                    </Link>
                    <div className="border-b border-gray-200"></div>
                    <Link href="/my-favorites" className="block py-3 hover:opacity-80 transition-colors flex items-center space-x-3 text-black">
                      <Heart className="h-4 w-4" style={{ color: '#846549' }} />
                      <span>My Favourites</span>
                    </Link>
                    <div className="border-b border-gray-200"></div>
                    <Link href="/my-orders" className="block py-3 hover:opacity-80 transition-colors flex items-center space-x-3 text-black">
                      <Package className="h-4 w-4" style={{ color: '#846549' }} />
                      <span>My Orders</span>
                    </Link>
                    <div className="border-b border-gray-200"></div>
                    <button 
                      onClick={handleLogout}
                      className="block py-3 hover:opacity-80 transition-colors text-left w-full flex items-center space-x-3 text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
                
                {/* Login/Signup section - Only show if not authenticated */}
                {!isAuth && (
                  <div className="space-y-4 pt-4">
                    <Link href="/auth/login" className="block">
                      <Button 
                        className="w-full text-sm py-3" 
                        style={{ backgroundColor: 'rgba(156,86,26,255)', color: 'white' }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Login / Signup
                      </Button>
                    </Link>
                  </div>
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

            {/* User Account - Desktop Only */}
            {isAuth && currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative hidden md:flex">
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
              <Link href="/auth/login" className="hidden md:flex">
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