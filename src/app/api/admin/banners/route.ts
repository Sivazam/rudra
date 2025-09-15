import { NextRequest, NextResponse } from 'next/server';

// Mock data - in a real app, this would come from a database
let banners = [
  {
    id: '1',
    title: 'Handmade Rudraksha Mala',
    description: 'Authentic Spiritual Products',
    imageUrl: '/banners/rudraksha-mala.jpg',
    categoryLink: '/categories/rudraksha',
    altText: 'Handmade Rudraksha Mala Banner',
    isActive: true,
    order: 1
  },
  {
    id: '2',
    title: 'Sacred Malas Collection',
    description: 'Find Your Spiritual Path',
    imageUrl: '/banners/malas-collection.jpg',
    categoryLink: '/categories/malas',
    altText: 'Sacred Malas Collection Banner',
    isActive: true,
    order: 2
  },
  {
    id: '3',
    title: 'Divine Bracelets',
    description: 'Wear Your Faith',
    imageUrl: '/banners/bracelets.jpg',
    categoryLink: '/categories/bracelets',
    altText: 'Divine Bracelets Banner',
    isActive: true,
    order: 3
  },
  {
    id: '4',
    title: 'Spiritual Pendants',
    description: 'Carry Divinity With You',
    imageUrl: '/banners/pendants.jpg',
    categoryLink: '/categories/pendants',
    altText: 'Spiritual Pendants Banner',
    isActive: false,
    order: 4
  }
];

// GET /api/admin/banners - Get all banners
export async function GET(request: NextRequest) {
  try {
    // Return only active banners sorted by order
    const activeBanners = banners
      .filter(banner => banner.isActive)
      .sort((a, b) => a.order - b.order);

    return NextResponse.json({
      success: true,
      data: activeBanners
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// POST /api/admin/banners - Create new banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newBanner = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      categoryLink: body.categoryLink,
      altText: body.altText,
      isActive: body.isActive ?? true,
      order: body.order || banners.length + 1
    };

    banners.push(newBanner);

    return NextResponse.json({
      success: true,
      data: newBanner
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/banners - Update banner (would typically have :id in URL)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    const bannerIndex = banners.findIndex(banner => banner.id === id);
    
    if (bannerIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    banners[bannerIndex] = { ...banners[bannerIndex], ...updateData };

    return NextResponse.json({
      success: true,
      data: banners[bannerIndex]
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/banners - Delete banner (would typically have :id in URL)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const bannerIndex = banners.findIndex(banner => banner.id === id);
    
    if (bannerIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    banners.splice(bannerIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}