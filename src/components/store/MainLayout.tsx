import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SlideInCart } from './SlideInCart';

interface MainLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  clearSearch?: () => void;
}

export function MainLayout({ children, onSearch, clearSearch }: MainLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f0eb' }}>
      <Header onSearch={onSearch || (() => {})} clearSearch={clearSearch || (() => {})} />
      <main>
        {children}
      </main>
      <Footer />
      <SlideInCart />
    </div>
  );
}