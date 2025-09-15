import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { Variant } from '@/lib/models';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    let query = {};
    if (productId) {
      query = { productId };
    }

    const variants = await Variant.find(query)
      .populate('productId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ variants });
  } catch (error) {
    console.error('Error fetching admin variants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      productId,
      label,
      price,
      sku,
      inventory,
      discount,
      isDefault
    } = await request.json();

    if (!productId || !label || !price || !sku || inventory === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // If this is set as default, remove default from other variants of this product
    if (isDefault) {
      await Variant.updateMany(
        { productId },
        { isDefault: false }
      );
    }

    const variant = new Variant({
      productId,
      label,
      price,
      sku,
      inventory,
      discount: discount || 0,
      isDefault: isDefault || false
    });

    await variant.save();

    return NextResponse.json(
      { message: 'Variant created successfully', variant },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating variant:', error);
    return NextResponse.json(
      { error: 'Failed to create variant' },
      { status: 500 }
    );
  }
}