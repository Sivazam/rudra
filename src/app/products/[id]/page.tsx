'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, Heart, Share2, Shield, Check, ArrowRight, ShoppingCart, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCartStore } from '@/store/cartStore';
import { MainLayout } from '@/components/store/MainLayout';
import { useToast } from '@/hooks/use-toast';
import { useGlobalLoader } from '@/hooks/useGlobalLoader';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  spiritualMeaning?: string;
  deity: string;
  price: number;
  originalPrice?: number;
  discount: number;
  category: string;
  categoryName: string;
  images: string[];
  variants: Array<{
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount: number;
    stock: number;
    sku: string;
    inventory: number;
    isDefault?: boolean;
  }>;
  status: 'active' | 'inactive';
  stock: number;
  createdAt: string;
  defaultVariant?: any;
  origin?: string;
  specifications?: string[];
  wearGuide?: {
    title: string;
    steps: string[];
    image?: string;
  };
  careGuide?: {
    title: string;
    steps: string[];
    image?: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shakeButton, setShakeButton] = useState<'add-to-cart' | 'buy-now' | null>(null);
  const [shakeVariants, setShakeVariants] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  
  const { addItem, items } = useCartStore();
  const { toast } = useToast();
  const { showLoader, hideLoader } = useGlobalLoader();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      showLoader('api');
      try {
        const response = await fetch(`/api/products/id/${productId}`);
        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);
          // Set default variant if available
          if (productData.defaultVariant) {
            setSelectedVariant(productData.defaultVariant);
          }
        } else {
          console.error('Failed to fetch product');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
        hideLoader('api');
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, showLoader, hideLoader]);

  // Check if this product is already in cart - sum quantities of ALL variants
  const cartItemsForProduct = product ? items.filter(item => item.productId === product.id) : [];
  const totalQuantityInCart = cartItemsForProduct.reduce((sum, item) => sum + item.quantity, 0);
  
  // Check if the currently selected variant is already in cart
  const isCurrentVariantInCart = selectedVariant && 
    cartItemsForProduct.some(item => item.variant.label === selectedVariant.name);
  
  // For general operations, get the first item (for simplicity)
  const cartItem = cartItemsForProduct[0];
  
  // Update isInCart state when cart items or selected variant changes
  useEffect(() => {
    setIsInCart(isCurrentVariantInCart);
  }, [isCurrentVariantInCart]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Check if user has selected a variant (for products with variants)
    const availableVariants = product.variants.filter(v => v.inventory > 0);
    
    if (availableVariants.length > 1 && !selectedVariant) {
      // If multiple variants exist and user hasn't selected one, show shake effect
      setShakeVariants(true);
      toast({
        title: "Please select a variant",
        description: "Choose a variant before adding to cart",
        variant: "destructive",
      });
      
      // Remove shake effect after animation
      setTimeout(() => {
        setShakeVariants(false);
      }, 1000);
      return;
    }
    
    // If only one variant or user has selected a variant
    const variantToAdd = selectedVariant || availableVariants[0];
    if (variantToAdd) {
      // Add to cart
      addItem({
        productId: product.id,
        name: product.name,
        deity: product.deity,
        image: product.images[0],
        variant: {
          label: variantToAdd.name,
          price: variantToAdd.price,
          sku: variantToAdd.sku,
          discount: variantToAdd.discount
        }
      });
      
      // Open cart after adding item
      useCartStore.getState().openCart();
      
      toast({
        title: "Added to cart",
        description: `${product.name} added to cart`,
      });
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // Check if user has selected a variant (for products with variants)
    const availableVariants = product.variants.filter(v => v.inventory > 0);
    
    if (availableVariants.length > 1 && !selectedVariant) {
      // If multiple variants exist and user hasn't selected one, show shake effect
      setShakeVariants(true);
      toast({
        title: "Please select a variant",
        description: "Choose a variant before proceeding to buy",
        variant: "destructive",
      });
      
      // Remove shake effect after animation
      setTimeout(() => {
        setShakeVariants(false);
      }, 1000);
      return;
    }
    
    // If only one variant or user has selected a variant
    const variantToAdd = selectedVariant || availableVariants[0];
    if (variantToAdd) {
      // Add to cart
      addItem({
        productId: product.id,
        name: product.name,
        deity: product.deity,
        image: product.images[0],
        variant: {
          label: variantToAdd.name,
          price: variantToAdd.price,
          sku: variantToAdd.sku,
          discount: variantToAdd.discount
        }
      });
      
      toast({
        title: "Added to cart",
        description: `${product.name} added to cart`,
      });
      
      // Navigate to checkout (this will be implemented later)
      setTimeout(() => {
        // For now, just open cart
        useCartStore.getState().openCart();
      }, 500);
    }
  };

  const handleGoToCart = () => {
    useCartStore.getState().openCart();
  };

  const formatPrice = (price: number, discount: number = 0) => {
    const discountedPrice = price - (price * discount) / 100;
    return {
      current: `₹${discountedPrice.toLocaleString()}`,
      original: discount > 0 ? `₹${price.toLocaleString()}` : null,
      savings: discount > 0 ? `${discount}% OFF` : null
    };
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen" style={{ backgroundColor: '#f4f0eb' }}>
          {/* Global loader will be shown by the provider */}
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="min-h-screen" style={{ backgroundColor: '#f4f0eb' }}>
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <p>Product not found</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentPricing = formatPrice(selectedVariant?.price || product.price, selectedVariant?.discount || 0);

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#f4f0eb' }}>
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <a href="/" className="hover:opacity-80 transition-colors" style={{ color: 'rgba(156,86,26,255)' }}>Home</a>
            <span>/</span>
            <a 
              href={`/?category=${encodeURIComponent(product.categoryName)}`} 
              className="hover:opacity-80 transition-colors" 
              style={{ color: 'rgba(156,86,26,255)' }}
            >
              {product.categoryName}
            </a>
            <span>/</span>
            <span style={{ color: '#846549' }}>{product.name}</span>
          </nav>
        </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
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
                    alt={`${product.name} view ${index + 1}`}
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
                    {product.name} {product.subtitle}
                  </h1>
                  <p className="text-lg mb-4" style={{ color: '#846549' }}>{product.deity}</p>
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
                        i < Math.floor(product.rating)
                          ? 'fill-current'
                          : 'text-gray-300'
                      }`}
                      style={{ color: i < Math.floor(product.rating) ? 'rgba(160,82,16,255)' : undefined }}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium" style={{ color: '#755e3e' }}>{product.rating}</span>
                <span style={{ color: '#846549' }}>({product.reviews} reviews)</span>
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
              {product.origin && (
                <p className="text-sm" style={{ color: '#846549' }}>Origin: {product.origin}</p>
              )}
            </div>

            {/* Variant Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold" style={{ color: '#755e3e' }}>Select Variant</h3>
              <RadioGroup
                value={selectedVariant?.id || ''}
                onValueChange={(value) => {
                  const variant = product.variants.find(v => v.id === value);
                  setSelectedVariant(variant);
                }}
                className={`grid grid-cols-2 sm:grid-cols-4 gap-2 ${shakeVariants ? 'animate-shake' : ''}`}
              >
                {product.variants.map((variant) => {
                  const pricing = formatPrice(variant.price, variant.discount);
                  return (
                    <div key={variant.id} className="relative">
                      <RadioGroupItem
                        value={variant.id}
                        id={variant.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={variant.id}
                        className="flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all peer-data-[state=checked]:border-orange-600 peer-data-[state=checked]:bg-orange-50 hover:border-orange-400 min-h-[80px]"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-xs" style={{ color: '#755e3e' }}>{variant.name}</span>
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
                          
                          <div className="w-3 h-3 rounded-full flex-shrink-0 opacity-0 peer-data-[state=checked]:opacity-100" style={{
                            backgroundColor: 'rgba(156,86,26,255)'
                          }}></div>
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
            {product.specifications && product.specifications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#755e3e' }}>Product Specifications</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-white rounded-lg border" style={{ borderColor: '#846549' }}>
                      <Check className="h-5 w-5 flex-shrink-0" style={{ color: 'rgba(160,82,16,255)' }} />
                      <span className="text-sm" style={{ color: '#846549' }}>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0">
              <TabsTrigger value="description">Description</TabsTrigger>
              {product.spiritualMeaning && (
                <TabsTrigger value="spiritual">Spiritual Meaning</TabsTrigger>
              )}
              {product.wearGuide && (
                <TabsTrigger value="wear-guide">Wear Guide</TabsTrigger>
              )}
              {product.careGuide && (
                <TabsTrigger value="care-guide">Care Guide</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </TabsContent>
            
            {/* Spiritual Meaning Tab */}
            {product.spiritualMeaning && (
              <TabsContent value="spiritual" className="mt-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">Spiritual Significance</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.spiritualMeaning}
                  </p>
                </div>
              </TabsContent>
            )}
            
            {/* Wear Guide Tab */}
            {product.wearGuide && (
              <TabsContent value="wear-guide" className="mt-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">{product.wearGuide.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <ol className="space-y-3">
                        {product.wearGuide.steps.map((step, index) => (
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
                      {product.wearGuide.image ? (
                        <img
                          src={product.wearGuide.image}
                          alt="Wear Guide"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500">Wear Guide Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
            
          {/* Care Guide Tab */}
            {product.careGuide && (
              <TabsContent value="care-guide" className="mt-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">{product.careGuide.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <ol className="space-y-3">
                        {product.careGuide.steps.map((step, index) => (
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
                      {product.careGuide.image ? (
                        <img
                          src={product.careGuide.image}
                          alt="Care Guide"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500">Care Guide Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Fixed Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50" style={{ borderColor: '#846549' }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {!isInCart ? (
              <>
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
              </>
            ) : (
              <>
                {/* Go to Cart Button */}
                <Button
                  onClick={handleGoToCart}
                  className="flex-1"
                  size="lg"
                  style={{ backgroundColor: 'rgba(156,86,26,255)', color: 'white' }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Go to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  style={{ borderColor: '#846549', color: '#846549' }}
                >
                  Buy Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}