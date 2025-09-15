import { Header } from '@/components/store/Header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream">
      <Header onSearch={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-6xl font-bold text-orange-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="space-y-4">
            <Link href="/">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Go to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}