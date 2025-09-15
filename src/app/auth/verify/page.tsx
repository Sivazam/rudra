"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/shadcn/card";
import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";

export default function VerifyPage() {
	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const router = useRouter();

	useEffect(() => {
		// Retrieve phone number and confirmation result from sessionStorage
		const storedPhoneNumber = sessionStorage.getItem("phoneNumber");
		const confirmationResultData = sessionStorage.getItem("confirmationResult");

		if (!storedPhoneNumber || !confirmationResultData) {
			router.push("/auth/login");
			return;
		}

		setPhoneNumber(storedPhoneNumber);

		// Store confirmation result globally for verification
		try {
			const confirmationResult = JSON.parse(confirmationResultData);
			window.confirmationResult = confirmationResult;
		} catch (error) {
			console.error("Error parsing confirmation result:", error);
			router.push("/auth/login");
		}
	}, [router]);

	const handleVerifyOTP = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			if (!window.confirmationResult) {
				throw new Error("No confirmation result found");
			}

			const result = await window.confirmationResult.confirm(otp);
			const user = result.user;

			// Get ID token for session creation
			const idToken = await user.getIdToken();

			// Create session
			const response = await fetch("/api/session", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ idToken }),
			});

			if (response.ok) {
				// Clear sessionStorage
				sessionStorage.removeItem("phoneNumber");
				sessionStorage.removeItem("confirmationResult");

				// Redirect to dashboard or home
				router.push("/");
			} else {
				throw new Error("Failed to create session");
			}
		} catch (error: any) {
			setError(error.message);
			console.error("Error verifying OTP:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold text-orange-800">Verify OTP</CardTitle>
					<CardDescription className="text-orange-600">Enter the OTP sent to {phoneNumber}</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleVerifyOTP} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="otp">OTP Code</Label>
							<Input
								id="otp"
								type="text"
								placeholder="Enter 6-digit OTP"
								value={otp}
								onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
								maxLength={6}
								required
								className="border-orange-200 focus:border-orange-400 text-center text-lg tracking-widest"
							/>
						</div>

						{error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}

						<Button
							type="submit"
							className="w-full bg-orange-600 hover:bg-orange-700"
							disabled={loading || otp.length !== 6}
						>
							{loading ? "Verifying..." : "Verify OTP"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
