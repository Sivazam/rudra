import mongoose, { type Document, Schema } from "mongoose";

export interface IDiscount extends Document {
	code: string;
	type: "percentage" | "fixed";
	amount: number;
	expiry: Date;
	usageLimit: number;
	usedCount: number;
	minPurchaseAmount?: number;
	applicableProducts?: mongoose.Types.ObjectId[];
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const DiscountSchema = new Schema<IDiscount>(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			uppercase: true,
			trim: true,
		},
		type: {
			type: String,
			enum: ["percentage", "fixed"],
			required: true,
		},
		amount: {
			type: Number,
			required: true,
			min: 0,
		},
		expiry: {
			type: Date,
			required: true,
		},
		usageLimit: {
			type: Number,
			required: true,
			min: 1,
		},
		usedCount: {
			type: Number,
			default: 0,
		},
		minPurchaseAmount: {
			type: Number,
			required: false,
			min: 0,
		},
		applicableProducts: [
			{
				type: Schema.Types.ObjectId,
				ref: "Product",
			},
		],
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	},
);

// Index for code lookup
DiscountSchema.index({ code: 1 });

// Method to check if discount is valid
DiscountSchema.methods.isValid = function (): boolean {
	return this.isActive && this.usedCount < this.usageLimit && new Date() <= this.expiry;
};

export default mongoose.models.Discount || mongoose.model<IDiscount>("Discount", DiscountSchema);
