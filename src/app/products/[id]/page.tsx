'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, Heart, Share2, Shield, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCartStore } from '@/store/cartStore';
import { VariantSelector } from '@/components/store/VariantSelector';

// Mock product data - will be replaced with API call
const mockProduct = {
  id: '1',
  name: 'Natural 10 Mukhi Rudraksha',
  subtitle: '(Nepali)',
  deity: 'Lord Vishnu',
  price: 8800,
  originalPrice: 11000,
  rating: 4.8,
  reviews: 342,
  images: [
    '/products/10-mukhi-1.jpg',
    '/products/10-mukhi-2.jpg',
    '/products/10-mukhi-3.jpg',
    '/products/10-mukhi-4.jpg',
  ],
  origin: 'Nepali',
  description: 'Authentic 10 Mukhi Rudraksha bead from Nepal, blessed by Lord Vishnu. This powerful spiritual bead is known for bringing prosperity, protection, and spiritual growth to the wearer.',
  spiritualMeaning: 'The 10 Mukhi Rudraksha represents the ten directions and ten incarnations of Lord Vishnu. It is believed to remove negative energies and bring harmony to life.',
  specifications: [
    'Aura Cleansing',
    'Provides Protection',
    'Enhances Spiritual Growth',
    'Brings Prosperity',
    'Removes Negative Energies',
    'Improves Focus'
  ],
  wearGuide: {
    title: 'Rudraksha Wear Guide',
    steps: [
      'Purify the Rudraksha by soaking it in clean water overnight',
      'Choose an auspicious day (Monday or Thursday) for wearing',
      'Perform a small puja or prayer before wearing',
      'Wear it on a red or yellow thread',
      'Chant "Om Namah Shivaya" 108 times',
      'Remove during sleep, bath, and toilet visits'
    ],
    image: '/guides/wear-guide.jpg'
  },
  careGuide: {
    title: 'Rudraksha Care Guide',
    steps: [
      'Clean with soft brush and clean water monthly',
      'Avoid exposure to chemicals and perfumes',
      'Remove before swimming or bathing',
      'Store in a clean, dry place',
      'Re-energize by placing in sunlight for 1 hour weekly',
      'Avoid contact with sharp objects'
    ],
    image: '/guides/care-guide.jpg'
  },
  variants: [
    { label: 'Regular', price: 8800, sku: '10M-REG-001', discount: 0, inventory: 25, isDefault: true },
    { label: 'Medium', price: 12000, sku: '10M-MED-002', discount: 10, inventory: 15 },
    { label: 'Ultra', price: 18000, sku: '10M-ULT-003', discount: 15, inventory: 8 },
    { label: 'Rare', price: 25000, sku: '10M-RAR-004', discount: 20, inventory: 3 }
  ]
};

export default function ProductDetailPage() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(mockProduct.variants.find(v => v.isDefault));
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  
  const { addItem, items } = useCartStore();

  // Check if this product is already in cart
  const cartItem = items.find(item => item.productId === mockProduct.id);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      setShowVariantSelector(true);
      return;
    }

    addItem({
      productId: mockProduct.id,
      name: mockProduct.name,
      deity: mockProduct.deity,
      image: mockProduct.images[0],
      variant: {
        label: selectedVariant.label,
        price: selectedVariant.price,
        sku: selectedVariant.sku,
        discount: selectedVariant.discount
      }
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Navigate to checkout
  };

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
    setShowVariantSelector(false);
  };

  const formatPrice = (price: number, discount: number = 0) => {
    const discountedPrice = price - (price * discount) / 100;
    return {
      current: `₹${discountedPrice.toLocaleString()}`,
      original: discount > 0 ? `₹${price.toLocaleString()}` : null,
      savings: discount > 0 ? `${discount}% OFF` : null
    };
  };

  const currentPricing = formatPrice(selectedVariant?.price || mockProduct.price, selectedVariant?.discount || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm">
          <a href="/" className="text-orange-600 hover:text-orange-700">Home</a>
          <span>/</span>
          <a href="/categories" className="text-orange-600 hover:text-orange-700">Rudraksha</a>
          <span>/</span>
          <span className="text-gray-600">{mockProduct.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={mockProduct.images[selectedImage]}
                alt={mockProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {mockProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded border-2 overflow-hidden transition-all ${
                    selectedImage === index 
                      ? 'border-orange-600 ring-2 ring-orange-200' 
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

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {mockProduct.name} {mockProduct.subtitle}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">{mockProduct.deity}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="hidden sm:flex"
                >
                  <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </Button>
              </div>
              
              {/* Rating */}
              <div className="flex items-center space-x-2">
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
                <span className="text-lg font-medium">{mockProduct.rating}</span>
                <span className="text-gray-600">({mockProduct.reviews} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-bold text-orange-600">
                  {currentPricing.current}
                </span>
                {currentPricing.original && (
                  <span className="text-xl text-gray-500 line-through">
                    {currentPricing.original}
                  </span>
                )}
                {currentPricing.savings && (
                  <Badge className="bg-red-600 hover:bg-red-700">
                    {currentPricing.savings}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">Origin: {mockProduct.origin}</p>
            </div>

            {/* Variant Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Select Variant</h3>
              <RadioGroup
                value={selectedVariant?.label || ''}
                onValueChange={(value) => {
                  const variant = mockProduct.variants.find(v => v.label === value);
                  setSelectedVariant(variant);
                }}
                className="grid grid-cols-2 gap-3"
              >
                {mockProduct.variants.map((variant) => {
                  const pricing = formatPrice(variant.price, variant.discount);
                  return (
                    <div key={variant.label} className="relative">
                      <RadioGroupItem
                        value={variant.label}
                        id={variant.label}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={variant.label}
                        className="flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all peer-data-[state=checked]:border-orange-600 peer-data-[state=checked]:bg-orange-50 hover:border-orange-400"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{variant.label}</span>
                          {variant.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          {variant.discount > 0 && (
                            <span className="text-xs text-gray-500 line-through block">
                              {pricing.original}
                            </span>
                          )}
                          <span className="font-bold text-orange-600">
                            {pricing.current}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Stock: {variant.inventory}</p>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Product Specifications</h3>
              <div className="grid grid-cols-2 gap-3">
                {mockProduct.specifications.map((spec, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-white rounded-lg border">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {quantityInCart === 0 ? (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    size="lg"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    Buy Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <span className="font-medium text-orange-800">
                    {quantityInCart} item{quantityInCart > 1 ? 's' : ''} in cart
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => useCartStore.getState().openCart()}
                    >
                      View Cart
                    </Button>
                    <Button onClick={handleBuyNow}>
                      Buy Now
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Actions */}
            <div className="flex items-center space-x-4 pt-4 border-t">
              <Button variant="ghost" className="text-orange-600">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" className="text-orange-600">
                <Shield className="h-4 w-4 mr-2" />
                Authenticity Guarantee
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="spiritual">Spiritual Meaning</TabsTrigger>
              <TabsTrigger value="wear-guide">Wear Guide</TabsTrigger>
              <TabsTrigger value="care-guide">Care Guide</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {mockProduct.description}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="spiritual" className="mt-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Spiritual Significance</h3>
                <p className="text-gray-700 leading-relaxed">
                  {mockProduct.spiritualMeaning}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="wear-guide" className="mt-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">{mockProduct.wearGuide.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ol className="space-y-3">
                      {mockProduct.wearGuide.steps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Wear Guide Image</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="care-guide" className="mt-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">{mockProduct.careGuide.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ol className="space-y-3">
                      {mockProduct.careGuide.steps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Care Guide Image</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Variant Selector Modal */}
      <VariantSelector
        isOpen={showVariantSelector}
        onClose={() => setShowVariantSelector(false)}
        variants={mockProduct.variants}
        productName={mockProduct.name}
        productImage={mockProduct.images[0]}
        onVariantSelect={handleVariantSelect}
      />
    </div>
  );
}