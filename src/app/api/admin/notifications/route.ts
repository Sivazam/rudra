import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { notificationService } from '@/lib/services/notificationService';

// JWT secret handling with error prevention
const getJwtSecret = (): string => {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    if (typeof secret !== 'string') {
      console.error('JWT_SECRET is not a string, using fallback');
      return 'your-secret-key';
    }
    return secret;
  } catch (error) {
    console.error('Error accessing JWT_SECRET:', error);
    return 'your-secret-key';
  }
};

// Buffer-based secret handling to avoid instanceof issues
const getSecretBuffer = (): Buffer => {
  const secret = getJwtSecret();
  try {
    return Buffer.from(secret);
  } catch (error) {
    console.error('Error creating buffer from secret:', error);
    return Buffer.from('your-secret-key');
  }
};

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return null;
  }

  try {
    // Try multiple verification approaches
    try {
      const secretBuffer = getSecretBuffer();
      return jwt.verify(token, secretBuffer);
    } catch (error) {
      console.warn('Buffer verification failed, trying string approach');
      const secretString = getJwtSecret();
      return jwt.verify(token, secretString, { algorithms: ['HS256'] });
    }
  } catch (error) {
    return null;
  }
}

// GET /api/admin/notifications - Get all notifications
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    let notifications;
    if (unreadOnly) {
      notifications = await notificationService.getAllNotifications(limit);
      notifications = notifications.filter(n => !n.isRead);
    } else {
      notifications = await notificationService.getAllNotifications(limit);
    }

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/notifications - Update notification (mark as read/unread)
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, action } = body;

    if (!notificationId || !action) {
      return NextResponse.json(
        { success: false, error: 'Notification ID and action are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'markAsRead':
        await notificationService.markAsRead(notificationId);
        break;
      case 'markAllAsRead':
        await notificationService.markAllAsRead();
        break;
      case 'delete':
        await notificationService.deleteNotification(notificationId);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}