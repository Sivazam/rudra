import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/productService';
import VariantService from '@/lib/services/variantService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    
    // Get product by ID
    const product = await ProductService.getById(productId);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Try to get variants for the product, but handle errors gracefully
    let variants = [];
    let defaultVariant = null;
    
    try {
      const variantServiceInstance = new VariantService();
      variants = await variantServiceInstance.getVariantsByProductId(productId);
      const availableVariants = variants.filter(v => v.inventory > 0);
      defaultVariant = availableVariants.find(v => v.isDefault) || availableVariants[0] || null;
      
      // Transform variants to match the expected format
      variants = availableVariants.map(variant => ({
        id: variant.id,
        name: variant.label,
        price: variant.price,
        originalPrice: variant.price, // No original price in variant
        discount: variant.discount,
        stock: variant.inventory,
        sku: variant.sku,
        inventory: variant.inventory,
        isDefault: variant.isDefault
      }));
    } catch (error) {
      console.warn('Error fetching variants, using product data:', error);
      // If variants fail to load, create a default variant from product data
      variants = [{
        id: `default-${productId}`,
        name: 'Default',
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        discount: product.discount,
        stock: product.stock,
        sku: `SKU-${productId}`,
        inventory: product.stock,
        isDefault: true
      }];
      defaultVariant = variants[0];
    }

    return NextResponse.json({
      ...product,
      variants,
      defaultVariant,
      // Add additional fields expected by the product detail page
      rating: product.rating || 4.5,
      reviews: product.reviews || 10,
      subtitle: product.subtitle || '',
      spiritualMeaning: product.spiritualMeaning || '',
      deity: product.deity || product.categoryName,
      origin: product.origin || '',
      specifications: product.specifications || [],
      wearGuide: product.wearGuide || null,
      careGuide: product.careGuide || null
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}