import mongoose from "mongoose";

const conn = { isConnected: false };

export async function dbConnect() {
	if (conn.isConnected) {
		return;
	}

	try {
		const db = await mongoose.connect(process.env.MONGODB_URI!);
		conn.isConnected = db.connections[0].readyState === 1;
		console.log("MongoDB connected successfully");
	} catch (error) {
		console.error("MongoDB connection error:", error);
		throw new Error("Database connection failed");
	}
}
