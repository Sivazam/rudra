import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/lib/models/Product';
import { Variant } from '@/lib/models/Variant';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sort = searchParams.get('sort') || 'createdAt';

    // Build query
    let query: any = { status: 'active' };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { deity: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortObj: any = {};
    switch (sort) {
      case 'price-low':
        sortObj['variants.price'] = 1;
        break;
      case 'price-high':
        sortObj['variants.price'] = -1;
        break;
      case 'rating':
        sortObj['rating'] = -1;
        break;
      case 'newest':
      default:
        sortObj['createdAt'] = -1;
    }

    const skip = (page - 1) * limit;

    // Get products with populated variants
    const products = await Product.find(query)
      .populate('category', 'name slug iconUrl')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get variants for each product
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await Variant.find({ 
          productId: product._id,
          inventory: { $gt: 0 }
        }).sort({ isDefault: -1, price: 1 }).lean();

        return {
          ...product,
          variants,
          defaultVariant: variants.find(v => v.isDefault) || variants[0]
        };
      })
    );

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products: productsWithVariants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}