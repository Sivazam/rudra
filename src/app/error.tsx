'use client';

import { Header } from '@/components/store/Header';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream">
      <Header onSearch={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Something went wrong!</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            We're sorry, but something unexpected happened. Our team has been notified and we're working on it.
          </p>
          <div className="space-y-4">
            <Button
              onClick={reset}
              variant="outline"
              className="mr-4"
            >
              Try again
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Go to Homepage
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}