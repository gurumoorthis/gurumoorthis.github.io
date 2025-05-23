"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { supabase } from "@/supabaseClient";
import { ERROR_MESSAGES } from "@/utils/constants";
import { getToastOptions } from "@/utils/getToastOptions";

export default function ForgotPasswordPage() {
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [accessToken, setAccessToken] = useState<string | null>(null);

	// Check for access_token in URL hash
	useEffect(() => {
		const hash = window.location.hash;
		const token = new URLSearchParams(hash.slice(1)).get("access_token");
		if (token) {
			setAccessToken(token);
		}
	}, []);

	// Send password reset link
	const handlePasswordResetRequest = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/forgot-password`,
		});

		setLoading(false);

		if (error) {
			toast.error(error?.message ?? ERROR_MESSAGES.GENERIC, getToastOptions());
		} else {
			toast.success("Reset link sent. Check your email.", getToastOptions());
		}
	};

	// Update user's password
	const handleUpdatePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!accessToken) return;

		setLoading(true);

		const response = await supabase.auth.updateUser({
			password: newPassword,
		});

		setLoading(false);

		if (response.error) {
			toast.error(
				response.error?.message ?? ERROR_MESSAGES.GENERIC,
				getToastOptions(),
			);
		} else {
			toast.success("Password updated. You can now log in.", getToastOptions());
			router.push("/login");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 py-8">
			<div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow space-y-6">
				<div className="text-center space-y-2">
					<h2 className="text-2xl font-bold text-black">
						{accessToken ? "Set New Password" : "Forgot Password"}
					</h2>
					<p className="text-sm text-gray-500">
						{accessToken
							? "Enter a new password for your account."
							: "We'll send you a reset link via email."}
					</p>
				</div>

				{accessToken ? (
					<form onSubmit={handleUpdatePassword} className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="new-password" className="text-stone-800 text-md">
								New Password
							</Label>
							<Input
								required
								id="new-password"
								type="password"
								placeholder="Enter new password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								disabled={loading}
							/>
						</div>
						<Button
							type="submit"
							className="w-full btn-primary"
							size="lg"
							disabled={loading}
						>
							{loading ? "Updating..." : "Update Password"}
						</Button>
					</form>
				) : (
					<form onSubmit={handlePasswordResetRequest} className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="email" className="text-stone-800 text-md">
								Email Address
							</Label>
							<Input
								required
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={loading}
							/>
						</div>
						<Button
							type="submit"
							className="w-full btn-primary"
							size="lg"
							disabled={loading}
						>
							{loading ? "Sending..." : "Send Reset Link"}
						</Button>
					</form>
				)}

				{!accessToken && (
					<p className="mt-1 text-sm text-center text-black">
						<span>Remember your password?</span>{" "}
						<Link href="/login" className="text-primary font-medium">
							Login
						</Link>
					</p>
				)}
			</div>
		</div>
	);
}
