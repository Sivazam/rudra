import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Variant from '@/lib/models/Variant';
import Category from '@/lib/models/Category';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await connectDB();

    // Find product by ID or slug
    const product = await Product.findOne({
      $or: [
        { _id: id },
        { slug: id }
      ],
      status: 'active'
    })
      .populate('category', 'name slug iconUrl')
      .lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get variants for the product
    const variants = await Variant.find({ productId: product._id }).lean();
    const defaultVariant = variants.find(v => v.isDefault) || variants[0];

    return NextResponse.json({
      ...product,
      variants,
      defaultVariant,
      price: defaultVariant?.price || 0,
      originalPrice: defaultVariant?.discount > 0 
        ? defaultVariant.price + (defaultVariant.price * defaultVariant.discount / 100)
        : defaultVariant?.price || 0
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}