import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Variant from '@/lib/models/Variant';
import Category from '@/lib/models/Category';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sort = searchParams.get('sort') || 'createdAt';

    await connectDB();

    // Build query
    let query: any = { status: 'active' };

    if (category && category !== 'all') {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { deity: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    let sortOptions: any = {};
    switch (sort) {
      case 'price-low':
        sortOptions = { 'variants.price': 1 };
        break;
      case 'price-high':
        sortOptions = { 'variants.price': -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    // Get products with populated variants and category
    const products = await Product.find(query)
      .populate('category', 'name slug iconUrl')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get variants for each product
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await Variant.find({ productId: product._id }).lean();
        const defaultVariant = variants.find(v => v.isDefault) || variants[0];
        
        return {
          ...product,
          variants,
          defaultVariant,
          price: defaultVariant?.price || 0,
          originalPrice: defaultVariant?.discount > 0 
            ? defaultVariant.price + (defaultVariant.price * defaultVariant.discount / 100)
            : defaultVariant?.price || 0
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