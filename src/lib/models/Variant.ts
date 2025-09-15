import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from './Product';

export interface IVariantOption {
  label: string;
  price: number;
  sku: string;
  inventory: number;
  discount?: {
    type: 'percentage' | 'fixed';
    amount: number;
  };
}

export interface IVariant extends Document {
  product: mongoose.Types.ObjectId | IProduct;
  type: string; // e.g., "Mukhi", "Material", "Length"
  options: IVariantOption[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantOptionSchema = new Schema<IVariantOption>({
  label: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  inventory: {
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

const VariantSchema = new Schema<IVariant>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Mukhi', 'Material', 'Length', 'Size', 'Color']
  },
  options: [VariantOptionSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Variant || mongoose.model<IVariant>('Variant', VariantSchema);