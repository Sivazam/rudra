'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ShoppingCart, RefreshCw } from 'lucide-react';
import { MainLayout } from '@/components/store/MainLayout';

export default function OrderFailedPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any stale checkout flags
    sessionStorage.removeItem('fromCheckout');
  }, []);

  const handleRetry = () => {
    router.push('/cart');
  };

  const handleContinueShopping = () => {
    router.push('/');
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-amber-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-600">Your cart is still available for retry</span>
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <RefreshCw className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-600">You can try payment again</span>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-800">
                  Your payment could not be processed. Please check your payment details and try again. If the problem persists, please contact our support team.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Payment
                </Button>

                <Button
                  variant="outline"
                  onClick={handleContinueShopping}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>

              <div className="text-sm text-gray-500 pt-2">
                <p>Need help? Contact our support team:</p>
                <p className="font-medium text-gray-700 mt-1">+91 9177227726</p>
                <p className="text-orange-600">sanathanrudraksha@gmail.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
