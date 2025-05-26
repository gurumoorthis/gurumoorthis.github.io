"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";
import { getToastOptions } from "@/utils/getToastOptions";

export default function SignUpPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error("Passwords do not match", getToastOptions());
			return;
		}
		setLoading(true);
		try {
			const signUpResponse = await supabase.auth.signUp({
				email,
				password,
			});

			if (signUpResponse.error) {
				toast.error(
					`Error signing up: ${signUpResponse.error.message}`,
					getToastOptions(),
				);
				setLoading(false);
				return;
			}

			const userDetails = signUpResponse.data.user;
			if (!userDetails) {
				toast.error("User details missing after signup.", getToastOptions());
				setLoading(false);
				return;
			}

			const { data: roleData, error: roleError } = await supabase
				.from("roles")
				.select("id")
				.eq("name", "policy_holder")
				.single();

			if (roleError) {
				toast.error(
					`Error fetching role: ${roleError.message}`,
					getToastOptions(),
				);
				setLoading(false);
				return;
			}

			const roleId = roleData?.id;
			if (!roleId) {
				toast.error("Role ID not found.", getToastOptions());
				setLoading(false);
				return;
			}

			const insertResponse = await supabase.from("users").insert([
				{
					id: userDetails.id,
					email: userDetails.email,
					role_id: roleId,
				},
			]);

			if (insertResponse.error) {
				toast.error(
					insertResponse.error.message ??
						"An error occurred while saving user data.",
					getToastOptions(),
				);
				setLoading(false);
				return;
			}

			toast.success(
				"Confirmation email sent. Please check your inbox.",
				getToastOptions(),
			);
			router.push("/login");
		} catch (error) {
			toast.error(
				`Unexpected error: ${(error as Error).message}`,
				getToastOptions(),
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col md:flex-row">
			<div className="flex-1 flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow space-y-6">
					<div className="text-center space-y-2">
						<h2 className="text-2xl font-bold text-black ">Sign Up</h2>
						<p className="text-sm text-muted-foreground text-gray-500">
							Sign up in seconds. No credit card required.
						</p>
					</div>
					<form onSubmit={handleSubmit} className="space-y-5">
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

						<div className="space-y-2">
							<Label htmlFor="password" className="text-stone-800 text-md">
								Password
							</Label>
							<div className="relative">
								<Input
									required
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value.trim())}
									disabled={loading}
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute top-1/2 right-2 -translate-y-1/2 h-6 w-6 cursor-pointer"
									onClick={() => setShowPassword((prev) => !prev)}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="confirmPassword"
								className="text-stone-800 text-md"
							>
								Confirm Password
							</Label>
							<Input
								required
								id="confirmPassword"
								type={showPassword ? "text" : "password"}
								placeholder="Confirm your password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value.trim())}
								disabled={loading}
							/>
						</div>

						<Button
							type="submit"
							className="w-full btn-primary"
							disabled={loading}
							size="lg"
						>
							{loading ? "Creating account..." : "Sign Up"}
						</Button>
					</form>
					<p className="mt-1 text-sm text-center text-black">
						Already have an account?{" "}
						<Link href="/login" className="text-primary font-medium">
							Login Here
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
