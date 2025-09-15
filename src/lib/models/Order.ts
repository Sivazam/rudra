import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  variantId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  discount?: {
    type: 'percentage' | 'fixed';
    amount: number;
  };
}

export interface IOrder extends Document {
  userId?: string; // Firebase user ID
  items: IOrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'delivered';
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  discountCode?: string;
  paymentMethod: 'razorpay' | 'cod';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  variantId: {
    type: Schema.Types.ObjectId,
    ref: 'Variant',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: false
    },
    amount: {
      type: Number,
      required: false,
      min: 0
    }
  }
});

const ShippingAddressSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'India'
  }
});

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    required: false
  },
  items: [OrderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  razorpayOrderId: {
    type: String,
    required: false
  },
  razorpayPaymentId: {
    type: String,
    required: false
  },
  razorpaySignature: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled', 'delivered'],
    default: 'pending'
  },
  shippingAddress: {
    type: ShippingAddressSchema,
    required: true
  },
  discountCode: {
    type: String,
    required: false
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod'],
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);