import { getAuth } from "firebase-admin/auth";
import { type NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
	try {
		const { idToken } = await request.json();

		if (!idToken) {
			return NextResponse.json({ error: "ID token is required" }, { status: 400 });
		}

		const auth = getAuth(app);
		const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

		const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

		const response = NextResponse.json({ status: "success" });

		response.cookies.set("session", sessionCookie, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: expiresIn / 1000,
			sameSite: "lax",
		});

		return response;
	} catch (error: any) {
		console.error("Session creation error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
