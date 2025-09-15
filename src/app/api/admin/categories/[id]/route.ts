import { getAuth } from "firebase-admin/auth";
import { type NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Category } from "@/lib/models";

// Initialize Firebase Admin
const serviceAccount = {
	type: process.env.FIREBASE_TYPE,
	project_id: process.env.FIREBASE_PROJECT_ID,
	private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
	private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
	client_email: process.env.FIREBASE_CLIENT_EMAIL,
	client_id: process.env.FIREBASE_CLIENT_ID,
	auth_uri: process.env.FIREBASE_AUTH_URI,
	token_uri: process.env.FIREBASE_TOKEN_URI,
	auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
	client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

let app: any;

if (!app) {
	try {
		const admin = require("firebase-admin");
		app = admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
		});
	} catch (error) {
		console.error("Firebase admin initialization error:", error);
	}
}

// Helper function to verify admin session
async function verifyAdminSession(request: NextRequest) {
	const sessionCookie = request.cookies.get("session")?.value;

	if (!sessionCookie) {
		return null;
	}

	try {
		const auth = getAuth(app);
		const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

		if (decodedClaims.admin !== true) {
			return null;
		}

		return decodedClaims;
	} catch (error) {
		console.error("Session verification error:", error);
		return null;
	}
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const adminUser = await verifyAdminSession(request);
		if (!adminUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await dbConnect();

		const category = await Category.findById(params.id);

		if (!category) {
			return NextResponse.json({ error: "Category not found" }, { status: 404 });
		}

		return NextResponse.json(category);
	} catch (error: any) {
		console.error("Error fetching category:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const adminUser = await verifyAdminSession(request);
		if (!adminUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await dbConnect();

		const body = await request.json();
		const { name, description, iconUrl, isActive } = body;

		const category = await Category.findByIdAndUpdate(
			params.id,
			{ name, description, iconUrl, isActive },
			{ new: true, runValidators: true },
		);

		if (!category) {
			return NextResponse.json({ error: "Category not found" }, { status: 404 });
		}

		return NextResponse.json(category);
	} catch (error: any) {
		console.error("Error updating category:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const adminUser = await verifyAdminSession(request);
		if (!adminUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await dbConnect();

		const category = await Category.findByIdAndDelete(params.id);

		if (!category) {
			return NextResponse.json({ error: "Category not found" }, { status: 404 });
		}

		return NextResponse.json({ message: "Category deleted successfully" });
	} catch (error: any) {
		console.error("Error deleting category:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
