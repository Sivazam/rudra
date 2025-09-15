import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  variantId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  discount: number;
}

export interface IOrder extends Document {
  userId: string;
  items: IOrderItem[];
  total: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    required: true
  },
  items: [{
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
      type: Number,
      default: 0,
      min: 0
    }
  }],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
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
    }
  }
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);