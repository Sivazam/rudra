// @ts-check

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		// Razorpay Configuration
		RAZORPAY_KEY_ID: z.string(),
		RAZORPAY_KEY_SECRET: z.string(),
		RAZORPAY_WEBHOOK_SECRET: z.string(),

		// MongoDB Configuration
		MONGODB_URI: z.string().url(),

		// Firebase Configuration
		FIREBASE_TYPE: z.string(),
		FIREBASE_PROJECT_ID: z.string(),
		FIREBASE_PRIVATE_KEY_ID: z.string(),
		FIREBASE_PRIVATE_KEY: z.string(),
		FIREBASE_CLIENT_EMAIL: z.string(),
		FIREBASE_CLIENT_ID: z.string(),
		FIREBASE_AUTH_URI: z.string().url(),
		FIREBASE_TOKEN_URI: z.string().url(),
		FIREBASE_AUTH_PROVIDER_X509_CERT_URL: z.string().url(),
		FIREBASE_CLIENT_X509_CERT_URL: z.string().url(),
	},
	client: {
		// Firebase Public Configuration
		NEXT_PUBLIC_FIREBASE_API_KEY: z.string(),
		NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
		NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string(),
		NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string(),
		NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string(),
		NEXT_PUBLIC_FIREBASE_APP_ID: z.string(),

		// Razorpay Public Configuration
		NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string(),

		// Application Configuration
		NEXT_PUBLIC_URL: z.string().url().optional(),
		NEXT_PUBLIC_LANGUAGE: z.string().optional().default("en-US"),
	},
	runtimeEnv: {
		// Razorpay Configuration
		RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
		RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
		RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,

		// MongoDB Configuration
		MONGODB_URI: process.env.MONGODB_URI,

		// Firebase Configuration
		FIREBASE_TYPE: process.env.FIREBASE_TYPE,
		FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
		FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID,
		FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
		FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
		FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID,
		FIREBASE_AUTH_URI: process.env.FIREBASE_AUTH_URI,
		FIREBASE_TOKEN_URI: process.env.FIREBASE_TOKEN_URI,
		FIREBASE_AUTH_PROVIDER_X509_CERT_URL: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
		FIREBASE_CLIENT_X509_CERT_URL: process.env.FIREBASE_CLIENT_X509_CERT_URL,

		// Firebase Public Configuration
		NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
		NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
		NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,

		// Razorpay Public Configuration
		NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

		// Application Configuration
		NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
		NEXT_PUBLIC_LANGUAGE: process.env.NEXT_PUBLIC_LANGUAGE,
	},
});

const publicUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

// force type inference to string
const _publicUrl = publicUrl;
export { _publicUrl as publicUrl };
