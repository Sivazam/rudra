'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, Heart, Share2, Shield, Check, ArrowRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCartStore } from '@/store/cartStore';
import { VariantSelector } from '@/components/store/VariantSelector';
import { MainLayout } from '@/components/store/MainLayout';
import { useToast } from '@/hooks/use-toast';

// Mock product data - will be replaced with API call
const mockProducts = [
  {
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
  },
  {
    id: '2',
    name: 'Natural 9 Mukhi Rudraksha',
    subtitle: '(Nepali)',
    deity: 'Goddess Durga',
    price: 1299,
    originalPrice: 1599,
    rating: 4.8,
    reviews: 423,
    images: [
      '/products/9-mukhi.jpg',
      '/products/9-mukhi-1.jpg',
      '/products/9-mukhi-2.jpg',
      '/products/9-mukhi-3.jpg',
    ],
    origin: 'Nepali',
    description: 'Authentic 9 Mukhi Rudraksha bead representing Goddess Durga. This powerful bead is known for providing protection, courage, and removing obstacles.',
    spiritualMeaning: 'The 9 Mukhi Rudraksha represents the nine forms of Goddess Durga. It is believed to provide protection from negative energies and enhance courage.',
    specifications: [
      'Goddess Durga Blessings',
      'Removes Obstacles',
      'Provides Protection',
      'Enhances Courage',
      'Improves Confidence',
      'Spiritual Growth'
    ],
    wearGuide: {
      title: 'Rudraksha Wear Guide',
      steps: [
        'Purify the Rudraksha by soaking it in clean water overnight',
        'Choose an auspicious day (Tuesday or Friday) for wearing',
        'Perform a small puja or prayer before wearing',
        'Wear it on a red or yellow thread',
        'Chant "Om Dum Durgayei Namaha" 108 times',
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
      { label: 'Regular', price: 1299, sku: '9M-REG-001', discount: 0, inventory: 30, isDefault: true },
      { label: 'Medium', price: 1899, sku: '9M-MED-002', discount: 5, inventory: 20 },
      { label: 'Ultra', price: 2599, sku: '9M-ULT-003', discount: 10, inventory: 12 },
      { label: 'Rare', price: 3499, sku: '9M-RAR-004', discount: 15, inventory: 6 }
    ]
  },
  {
    id: '3',
    name: 'Natural 5 Mukhi Rudraksha',
    subtitle: '(Indonesian)',
    deity: 'Lord Shiva',
    price: 799,
    originalPrice: 999,
    rating: 4.9,
    reviews: 612,
    images: [
      '/products/5-mukhi.jpg',
      '/products/5-mukhi-1.jpg',
      '/products/5-mukhi-2.jpg',
      '/products/5-mukhi-3.jpg',
    ],
    origin: 'Indonesian',
    description: 'Authentic 5 Mukhi Rudraksha bead blessed by Lord Shiva. This is the most commonly available Rudraksha, known for bringing peace and spiritual growth.',
    spiritualMeaning: 'The 5 Mukhi Rudraksha represents the five faces of Lord Shiva. It is believed to bring peace, prosperity, and spiritual enlightenment.',
    specifications: [
      'Lord Shiva Blessings',
      'Brings Peace',
      'Enhances Meditation',
      'Improves Focus',
      'Spiritual Growth',
      'Removes Stress'
    ],
    wearGuide: {
      title: 'Rudraksha Wear Guide',
      steps: [
        'Purify the Rudraksha by soaking it in clean water overnight',
        'Choose an auspicious day (Monday) for wearing',
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
      { label: 'Regular', price: 799, sku: '5M-REG-001', discount: 0, inventory: 50, isDefault: true },
      { label: 'Medium', price: 1199, sku: '5M-MED-002', discount: 8, inventory: 35 },
      { label: 'Ultra', price: 1599, sku: '5M-ULT-003', discount: 12, inventory: 20 },
      { label: 'Rare', price: 2199, sku: '5M-RAR-004', discount: 18, inventory: 10 }
    ]
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  // Find the product based on ID
  const mockProduct = mockProducts.find(p => p.id === productId) || mockProducts[0];
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(mockProduct.variants.find(v => v.isDefault));
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [showRepeatDialog, setShowRepeatDialog] = useState(false);
  const [shakeButton, setShakeButton] = useState<'add-to-cart' | 'buy-now' | null>(null);
  const [shakeVariants, setShakeVariants] = useState(false);
  
  const { addItem, items } = useCartStore();
  const { toast } = useToast();

  // Check if this product is already in cart - sum quantities of ALL variants
  const cartItemsForProduct = items.filter(item => item.productId === mockProduct.id);
  const totalQuantityInCart = cartItemsForProduct.reduce((sum, item) => sum + item.quantity, 0);
  
  // For general operations, get the first item (for simplicity)
  const cartItem = cartItemsForProduct[0];

  const handleAddToCart = () => {
    // Check if product has multiple variants
    const availableVariants = mockProduct.variants.filter(v => v.inventory > 0);
    
    // If user hasn't selected a variant and there are multiple variants, show shake effect and toast
    if (!selectedVariant && availableVariants.length > 1) {
      setShakeButton('add-to-cart');
      setShakeVariants(true);
      toast({
        title: "Please select a variant",
        description: "Choose a variant before adding to cart",
        variant: "destructive",
      });
      
      // Remove shake effects after animation
      setTimeout(() => {
        setShakeButton(null);
        setShakeVariants(false);
      }, 1000);
      return;
    }
    
    // If only one variant available or user has selected a variant
    const variantToAdd = selectedVariant || availableVariants[0];
    if (variantToAdd) {
      // Check if this specific variant is already in cart
      const existingVariantItem = cartItemsForProduct.find(item => 
        item.variant.label === variantToAdd.label
      );
      
      if (existingVariantItem) {
        // If variant already exists, show dialog to ask if user wants to add more or select different
        setShowRepeatDialog(true);
      } else {
        // If variant doesn't exist, add it directly
        addItem({
          productId: mockProduct.id,
          name: mockProduct.name,
          deity: mockProduct.deity,
          image: mockProduct.images[0],
          variant: {
            label: variantToAdd.label,
            price: variantToAdd.price,
            sku: variantToAdd.sku,
            discount: variantToAdd.discount
          }
        });
        
        toast({
          title: "Added to cart",
          description: `${mockProduct.name} added to cart`,
        });
      }
    }
  };

  const handleBuyNow = () => {
    // Check if product has multiple variants
    const availableVariants = mockProduct.variants.filter(v => v.inventory > 0);
    
    // If user hasn't selected a variant and there are multiple variants, show shake effect and toast
    if (!selectedVariant && availableVariants.length > 1) {
      setShakeButton('buy-now');
      setShakeVariants(true);
      toast({
        title: "Please select a variant",
        description: "Choose a variant before proceeding to buy",
        variant: "destructive",
      });
      
      // Remove shake effects after animation
      setTimeout(() => {
        setShakeButton(null);
        setShakeVariants(false);
      }, 1000);
      return;
    }
    
    // If only one variant available or user has selected a variant
    const variantToAdd = selectedVariant || availableVariants[0];
    if (variantToAdd) {
      // Check if this specific variant is already in cart
      const existingVariantItem = cartItemsForProduct.find(item => 
        item.variant.label === variantToAdd.label
      );
      
      if (existingVariantItem) {
        // If variant already exists, show dialog to ask if user wants to add more or select different
        setShowRepeatDialog(true);
      } else {
        // If variant doesn't exist, add it directly
        addItem({
          productId: mockProduct.id,
          name: mockProduct.name,
          deity: mockProduct.deity,
          image: mockProduct.images[0],
          variant: {
            label: variantToAdd.label,
            price: variantToAdd.price,
            sku: variantToAdd.sku,
            discount: variantToAdd.discount
          }
        });
        
        // Navigate to checkout (this will be implemented later)
        setTimeout(() => {
          // For now, just open cart
          useCartStore.getState().openCart();
        }, 500);
      }
    }
  };

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
    setShowVariantSelector(false);
    
    // Add to cart after variant selection
    addItem({
      productId: mockProduct.id,
      name: mockProduct.name,
      deity: mockProduct.deity,
      image: mockProduct.images[0],
      variant: {
        label: variant.label,
        price: variant.price,
        sku: variant.sku,
        discount: variant.discount
      }
    });
    
    toast({
      title: "Added to cart",
      description: `${mockProduct.name} added to cart`,
    });
  };

  const handleIncrementQuantity = () => {
    if (totalQuantityInCart === 0) {
      // If no items in cart, use the add to cart flow
      handleAddToCart();
    } else {
      // If items already exist, increment the first item's quantity (standard ecommerce behavior)
      if (cartItem) {
        useCartStore.getState().updateQuantity(cartItem.id, cartItem.quantity + 1);
        toast({
          title: "Quantity updated",
          description: `${mockProduct.name} quantity increased to ${cartItem.quantity + 1}`,
        });
      }
    }
  };

  const handleDecrementQuantity = () => {
    if (cartItem && cartItem.quantity > 1) {
      // Decrement the first item's quantity
      useCartStore.getState().updateQuantity(cartItem.id, cartItem.quantity - 1);
      toast({
        title: "Quantity updated",
        description: `${mockProduct.name} quantity decreased to ${cartItem.quantity - 1}`,
      });
    } else if (cartItem && cartItem.quantity === 1) {
      // Remove the item if quantity is 1
      useCartStore.getState().removeItem(cartItem.id);
      toast({
        title: "Item removed",
        description: `${mockProduct.name} removed from cart`,
      });
    }
  };

  const handleRepeat = () => {
    // Simply increment the first item's quantity (standard ecommerce behavior)
    if (cartItem) {
      useCartStore.getState().updateQuantity(cartItem.id, cartItem.quantity + 1);
      toast({
        title: "Quantity updated",
        description: `${mockProduct.name} quantity increased to ${cartItem.quantity + 1}`,
      });
    }
    setShowRepeatDialog(false);
  };

  const handleSelectDifferentVariant = () => {
    setShowRepeatDialog(false);
    // Shake the variant boxes instead of opening popup
    setShakeVariants(true);
    toast({
      title: "Select a variant",
      description: "Please choose a variant from the options above",
      variant: "destructive",
    });
    
    // Remove shake effect after animation
    setTimeout(() => setShakeVariants(false), 1000);
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
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#f4f0eb' }}>
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <a href="/" className="hover:opacity-80 transition-colors" style={{ color: 'rgba(156,86,26,255)' }}>Home</a>
            <span>/</span>
          <a href="/categories" className="hover:opacity-80 transition-colors" style={{ color: 'rgba(156,86,26,255)' }}>Rudraksha</a>
          <span>/</span>
          <span style={{ color: '#846549' }}>{mockProduct.name}</span>
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
                  <h1 className="text-3xl font-bold mb-2" style={{ color: '#755e3e' }}>
                    {mockProduct.name} {mockProduct.subtitle}
                  </h1>
                  <p className="text-lg mb-4" style={{ color: '#846549' }}>{mockProduct.deity}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="hidden sm:flex"
                >
                  <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : 'text-gray-400'}`} style={{ color: isWishlisted ? '#f20600' : undefined }} />
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
                          ? 'fill-current'
                          : 'text-gray-300'
                      }`}
                      style={{ color: i < Math.floor(mockProduct.rating) ? 'rgba(160,82,16,255)' : undefined }}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium" style={{ color: '#755e3e' }}>{mockProduct.rating}</span>
                <span style={{ color: '#846549' }}>({mockProduct.reviews} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-bold" style={{ color: '#755e3e' }}>
                  {currentPricing.current}
                </span>
                {currentPricing.original && (
                  <span className="text-xl line-through" style={{ color: '#846549' }}>
                    {currentPricing.original}
                  </span>
                )}
                {currentPricing.savings && (
                  <Badge className="bg-red-600 hover:bg-red-700">
                    {currentPricing.savings}
                  </Badge>
                )}
              </div>
              <p className="text-sm" style={{ color: '#846549' }}>Origin: {mockProduct.origin}</p>
            </div>

            {/* Variant Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold" style={{ color: '#755e3e' }}>Select Variant</h3>
              <RadioGroup
                value={selectedVariant?.label || ''}
                onValueChange={(value) => {
                  const variant = mockProduct.variants.find(v => v.label === value);
                  setSelectedVariant(variant);
                }}
                className={`grid grid-cols-2 sm:grid-cols-4 gap-2 ${shakeVariants ? 'animate-shake' : ''}`}
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
                        className="flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all peer-data-[state=checked]:border-orange-600 peer-data-[state=checked]:bg-orange-50 hover:border-orange-400 min-h-[80px]"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-xs" style={{ color: '#755e3e' }}>{variant.label}</span>
                          <div className="flex space-x-1">
                            {variant.isDefault && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">Default</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-right">
                            {variant.discount > 0 && (
                              <span className="text-xs line-through block" style={{ color: '#846549' }}>
                                {pricing.original}
                              </span>
                            )}
                            <span className="font-bold text-xs" style={{ color: '#755e3e' }}>
                              {pricing.current}
                            </span>
                          </div>
                          
                          <div className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{
                            borderColor: 'rgba(156,86,26,255)',
                            backgroundColor: 'white'
                          }}>
                            <div className="w-full h-full flex items-center justify-center opacity-0 peer-data-[state=checked]:opacity-100">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                          </div>
                        </div>
                        
                        {pricing.savings && (
                          <div className="flex justify-between items-center">
                            <Badge className="bg-red-600 hover:bg-red-700 text-xs px-1 py-0">
                              {pricing.savings}
                            </Badge>
                            <span className="text-xs" style={{ color: '#846549' }}>Stock: {variant.inventory}</span>
                          </div>
                        )}
                        
                        {!pricing.savings && (
                          <p className="text-xs text-right" style={{ color: '#846549' }}>Stock: {variant.inventory}</p>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#755e3e' }}>Product Specifications</h3>
              <div className="grid grid-cols-2 gap-3">
                {mockProduct.specifications.map((spec, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-white rounded-lg border" style={{ borderColor: '#846549' }}>
                    <Check className="h-5 w-5 flex-shrink-0" style={{ color: 'rgba(160,82,16,255)' }} />
                    <span className="text-sm" style={{ color: '#846549' }}>{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Actions */}
            <div className="flex items-center space-x-4 pt-4 border-t" style={{ borderColor: '#846549' }}>
              <Button variant="ghost" style={{ color: 'rgba(156,86,26,255)' }}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" style={{ color: 'rgba(156,86,26,255)' }}>
                <Shield className="h-4 w-4 mr-2" />
                Authenticity Guarantee
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12 mb-24"> {/* Added mb-24 to account for fixed buttons */}
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

      {/* Repeat or Select Different Variant Dialog */}
      <Dialog open={showRepeatDialog} onOpenChange={setShowRepeatDialog}>
        <DialogContent className="sm:max-w-[90%] sm:rounded-lg max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:rounded-t-lg max-sm:max-w-none max-sm:translate-y-0">
          <DialogHeader>
            <DialogTitle>Add more items?</DialogTitle>
            <DialogDescription>
              You already have {totalQuantityInCart} item{totalQuantityInCart > 1 ? 's' : ''} in cart. Would you like to add more or select a different variant?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleSelectDifferentVariant} variant="outline" className="sm:flex-1" style={{ borderColor: '#846549', color: '#846549' }}>
              Select Different Variant
            </Button>
            <Button onClick={handleRepeat} className="sm:flex-1" style={{ backgroundColor: 'rgba(156,86,26,255)', color: 'white' }}>
              Add More
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fixed Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50" style={{ borderColor: '#846549' }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAddToCart}
              variant="outline"
              className={`flex-1 ${shakeButton === 'add-to-cart' ? 'animate-shake' : ''}`}
              size="lg"
              style={{ borderColor: '#846549', color: '#846549' }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              variant="outline"
              className={`flex-1 ${shakeButton === 'buy-now' ? 'animate-shake' : ''}`}
              size="lg"
              style={{ borderColor: '#846549', color: '#846549' }}
            >
              Buy Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}