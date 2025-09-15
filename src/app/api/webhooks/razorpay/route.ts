import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Order } from "@/lib/models";

const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
	try {
		const body = await request.text();
		const signature = request.headers.get("x-razorpay-signature")!;

		// Verify webhook signature
		const expectedSignature = crypto.createHmac("sha256", razorpayWebhookSecret).update(body).digest("hex");

		if (signature !== expectedSignature) {
			return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
		}

		const webhookData = JSON.parse(body);
		const event = webhookData.event;

		// Handle payment events
		if (event === "payment.captured") {
			const payment = webhookData.payload.payment.entity;

			await dbConnect();

			// Update order status
			await Order.findOneAndUpdate(
				{ razorpayOrderId: payment.order_id },
				{
					status: "paid",
					razorpayPaymentId: payment.id,
					razorpaySignature: signature,
				},
			);

			console.log(`Payment captured for order: ${payment.order_id}`);
		}

		return NextResponse.json({ status: "success" });
	} catch (error: any) {
		console.error("Razorpay webhook error:", error);
		return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
	}
}
