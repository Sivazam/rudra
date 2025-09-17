import { NextRequest, NextResponse } from 'next/server';
import { firestoreService, storageService } from '@/lib/firebase';

// GET /api/admin/products - Get all products
export async function GET(request: NextRequest) {
  try {
    console.log('Admin API: Getting all products');
    
    const products = await firestoreService.getAll('products', {
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
    
    console.log(`Admin API: Found ${products.length} products`);
    
    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Admin API: Error getting products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    console.log('Admin API: Creating new product');
    
    const formData = await request.formData();
    
    // Extract basic product data
    const name = formData.get('name') as string;
    const deity = formData.get('deity') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const status = formData.get('status') as string;
    const isBestseller = formData.get('isBestseller') === 'true';
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const variants = JSON.parse(formData.get('variants') as string || '[]');
    
    if (!name || !deity || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Name, deity, description, and category are required' },
        { status: 400 }
      );
    }
    
    // Handle image uploads
    const images = formData.getAll('images') as File[];
    let imageUrls: string[] = [];
    
    if (images.length > 0) {
      console.log(`Admin API: Uploading ${images.length} images`);
      imageUrls = await storageService.uploadFiles(images, 'products/rudra');
    }
    
    // Create product data
    const productData = {
      name,
      deity,
      description,
      category,
      image: imageUrls[0] || '',
      images: imageUrls,
      variants: variants.map((v: any) => ({
        ...v,
        id: v.id || Date.now().toString() + Math.random()
      })),
      tags,
      status,
      isBestseller,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const productId = await firestoreService.create('products', productData);
    
    console.log(`Admin API: Product created with ID ${productId}`);
    
    return NextResponse.json({
      success: true,
      data: { id: productId, ...productData }
    }, { status: 201 });
  } catch (error) {
    console.error('Admin API: Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}