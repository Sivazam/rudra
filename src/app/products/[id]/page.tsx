'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/store/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, Shield, Check, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// Mock product data - will be replaced with API call
const mockProduct = {
  id: '1',
  name: 'Natural 10 Mukhi Rudraksha (Nepali)',
  deity: 'Lord Vishnu',
  description: 'This powerful 10 Mukhi Rudraksha represents Lord Vishnu, the preserver of the universe. It provides protection and removes obstacles from the wearer\'s life.',
  spiritualMeaning: 'The 10 Mukhi Rudraksha is blessed by Lord Vishnu and helps in overcoming challenges and achieving success in all endeavors.',
  price: 8800,
  originalPrice: 11000,
  rating: 4.8,
  reviews: 342,
  origin: 'Nepali',
  material: 'Natural Rudraksha',
  images: [
    '/products/10-mukhi-1.jpg',
    '/products/10-mukhi-2.jpg',
    '/products/10-mukhi-3.jpg',
    '/products/10-mukhi-4.jpg'
  ],
  variants: [
    { label: 'Regular', price: 8800, sku: '10MR-REG-001', inventory: 15, isDefault: true },
    { label: 'Medium', price: 9900, sku: '10MR-MED-002', inventory: 8 },
    { label: 'Ultra', price: 12100, sku: '10MR-ULT-003', inventory: 3 },
    { label: 'Rare', price: 15400, sku: '10MR-RAR-004', inventory: 1 }
  ],
  specifications: [
    'Aura Cleansing',
    'Provides Protection',
    'Removes Obstacles',
    'Brings Success',
    'Enhances Confidence',
    'Spiritual Growth'
  ],
  wearGuide: {
    title: 'Rudraksha Wear Guide',
    steps: [
      'Clean the Rudraksha with Gangajal or clean water',
      'Energize the bead by chanting "Om Namah Shivaya" 108 times',
      'Wear it on Monday morning after bath',
      'Touch the Rudraksha to a Shiva Lingam if possible',
      'Wear it on a red or yellow thread',
      'Keep it clean and avoid contact with chemicals'
    ]
  },
  careGuide: {
    title: 'Rudraksha Care Guide',
    steps: [
      'Remove Rudraksha while bathing or swimming',
      'Avoid contact with perfumes, soaps, and chemicals',
      'Clean gently with soft brush if needed',
      'Store in a clean, dry place when not wearing',
      'Do not share your Rudraksha with others',
      'Re-energize every month on full moon day'
    ]
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState('Regular');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const currentVariant = mockProduct.variants.find(v => v.label === selectedVariant) || mockProduct.variants[0];
  const discountPercentage = Math.round(((mockProduct.originalPrice - mockProduct.price) / mockProduct.originalPrice) * 100);

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log('Added to cart:', { product: mockProduct, variant: currentVariant, quantity });
  };

  const handleBuyNow = () => {
    // Buy now logic here
    console.log('Buy now:', { product: mockProduct, variant: currentVariant, quantity });
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header onSearch={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm mb-6">
          <Link href="/" className="text-gray-600 hover:text-orange-600">Home</Link>
          <span>/</span>
          <Link href="/categories" className="text-gray-600 hover:text-orange-600">Rudraksha</Link>
          <span>/</span>
          <span className="text-gray-900">{mockProduct.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200">
              <img
                src={mockProduct.images[selectedImage]}
                alt={mockProduct.name}
                className="w-full h-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
              
              {discountPercentage > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-600 hover:bg-red-700">
                  {discountPercentage}% OFF
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {mockProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-orange-600' 
                      : 'border-gray-200 hover:border-orange-400'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${mockProduct.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {mockProduct.name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{mockProduct.deity}</p>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(mockProduct.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{mockProduct.rating}</span>
                <span className="text-gray-600">({mockProduct.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-orange-600">
                  ₹{currentVariant.price.toLocaleString()}
                </span>
                {mockProduct.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ₹{mockProduct.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Origin */}
              <div className="mb-6">
                <span className="text-sm text-gray-600">Origin:</span>
                <span className="ml-2 font-semibold text-gray-900">{mockProduct.origin}</span>
              </div>
            </div>

            {/* Variant Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Select Variant</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mockProduct.variants.map((variant) => (
                  <button
                    key={variant.label}
                    onClick={() => setSelectedVariant(variant.label)}
                    className={`p-3 border rounded-lg text-center transition-all ${
                      selectedVariant === variant.label
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-300 hover:border-orange-400'
                    }`}
                  >
                    <div className="font-medium">{variant.label}</div>
                    <div className="text-sm text-gray-600">₹{variant.price.toLocaleString()}</div>
                    {variant.inventory < 5 && (
                      <div className="text-xs text-red-600">Only {variant.inventory} left</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Product Specifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mockProduct.specifications.map((spec, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                    <Check className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-6">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg"
              >
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="outline"
                className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 py-3 text-lg"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>

        {/* Wear Guide Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-8 w-8 text-orange-600" />
              <h3 className="text-2xl font-bold text-gray-900">{mockProduct.wearGuide.title}</h3>
            </div>
            <ul className="space-y-3">
              {mockProduct.wearGuide.steps.map((step, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                  </div>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Care Guide Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-8 w-8 text-orange-600" />
              <h3 className="text-2xl font-bold text-gray-900">{mockProduct.careGuide.title}</h3>
            </div>
            <ul className="space-y-3">
              {mockProduct.careGuide.steps.map((step, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                  </div>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}