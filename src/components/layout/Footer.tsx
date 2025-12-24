import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-amber-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/categories/rudraksha" className="hover:text-amber-200 transition-colors">Rudraksha</a></li>
              <li><a href="/categories/malas" className="hover:text-amber-200 transition-colors">Malas</a></li>
              <li><a href="/categories/bracelets" className="hover:text-amber-200 transition-colors">Bracelets</a></li>
              <li><a href="/categories/pendants" className="hover:text-amber-200 transition-colors">Pendants</a></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><a href="/contact" className="hover:text-amber-200 transition-colors">Contact Us</a></li>
              <li><a href="/shipping" className="hover:text-amber-200 transition-colors">Shipping Info</a></li>
              <li><a href="/returns" className="hover:text-amber-200 transition-colors">Returns</a></li>
              <li><a href="/faq" className="hover:text-amber-200 transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="hover:text-amber-200 transition-colors">Our Story</a></li>
              <li><a href="/blog" className="hover:text-amber-200 transition-colors">Blog</a></li>
              <li><a href="/authenticity" className="hover:text-amber-200 transition-colors">Authenticity</a></li>
              <li><a href="/testimonials" className="hover:text-amber-200 transition-colors">Testimonials</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-sm">
              <li>info@sanathanrudraksha.com</li>
              <li>+91 9533777726</li>
              <li>No Return | No Exchange</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-amber-700 mt-8 pt-8 text-center">
          <p className="text-sm">Build by FactInMedia</p>
        </div>
      </div>
    </footer>
  );
}