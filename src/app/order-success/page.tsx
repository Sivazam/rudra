'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/store/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user came from checkout
    const referrer = document.referrer;
    if (!referrer.includes('/checkout')) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-cream">
      <Header onSearch={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-600">Order Placed Successfully!</CardTitle>
              <CardDescription className="text-lg">
                Thank you for your purchase. We'll send you a confirmation email shortly.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <Package className="h-8 w-8 text-orange-600 mx-auto" />
                  <h3 className="font-semibold">Order Confirmed</h3>
                  <p className="text-sm text-gray-600">Your order has been received</p>
                </div>
                
                <div className="space-y-2">
                  <Truck className="h-8 w-8 text-orange-600 mx-auto" />
                  <h3 className="font-semibold">Processing</h3>
                  <p className="text-sm text-gray-600">We're preparing your items</p>
                </div>
                
                <div className="space-y-2">
                  <Home className="h-8 w-8 text-orange-600 mx-auto" />
                  <h3 className="font-semibold">On the Way</h3>
                  <p className="text-sm text-gray-600">Delivered to your doorstep</p>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What's Next?</h4>
                <ul className="text-sm text-gray-700 space-y-1 text-left">
                  <li>• You'll receive an order confirmation email with details</li>
                  <li>• We'll process your order within 1-2 business days</li>
                  <li>• You'll receive tracking information once shipped</li>
                  <li>• Expected delivery: 5-7 business days</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
                
                <Link href="/account/orders" className="flex-1">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    View Orders
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}