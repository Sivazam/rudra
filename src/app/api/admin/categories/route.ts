import { NextRequest, NextResponse } from 'next/server';
import { firestoreService } from '@/lib/firebase';

// GET /api/admin/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    console.log('Admin API: Getting all categories');
    
    const categories = await firestoreService.getAll('categories', {
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
    
    console.log(`Admin API: Found ${categories.length} categories`);
    
    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Admin API: Error getting categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    console.log('Admin API: Creating new category');
    
    const body = await request.json();
    const { name, description, image, status } = body;
    
    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      );
    }
    
    const categoryData = {
      name,
      description,
      image: image || '',
      status: status || 'active',
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const categoryId = await firestoreService.create('categories', categoryData);
    
    console.log(`Admin API: Category created with ID ${categoryId}`);
    
    return NextResponse.json({
      success: true,
      data: { id: categoryId, ...categoryData }
    }, { status: 201 });
  } catch (error) {
    console.error('Admin API: Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}