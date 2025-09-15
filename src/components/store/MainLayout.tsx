import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
}

export function MainLayout({ children, onSearch }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f4f0eb' }}>
      <Header onSearch={onSearch || (() => {})} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}