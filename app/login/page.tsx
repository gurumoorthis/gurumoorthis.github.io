"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/utils/constants";
import { getToastOptions } from "@/utils/getToastOptions";
import { useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import { getUserById } from "@/redux/slice/AuthSlice";
import { useAppDispatch } from "@/redux/hooks";

export default function LoginPage() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		const response = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		setLoading(false);
		if (response.error) {
			toast.error(
				response.error?.message ?? ERROR_MESSAGES.GENERIC,
				getToastOptions(),
			);
		} else {
			toast.success("Login success", getToastOptions());
			const user = response.data.user;
			dispatch(getUserById(user.id ?? ""));
			secureLocalStorage.setItem("user_id", user.id);
			secureLocalStorage.setItem("email", user.email ?? "");
			secureLocalStorage.setItem("userRole", user.role ?? "");
			secureLocalStorage.setItem(
				"access_token",
				response.data?.session?.access_token ?? "",
			);
			secureLocalStorage.setItem(
				"refresh_token",
				response.data?.session?.refresh_token,
			);
			document.cookie = `access_token=${response.data?.session?.access_token}; Path=/; SameSite=Strict;`;
			document.cookie = `refresh_token=${response.data?.session?.refresh_token}; Path=/; SameSite=Strict;`;
			setTimeout(() => {
				router.push("/");
			}, 2000);
		}
	};

	return (
		<div className="min-h-screen flex flex-col md:flex-row">
			<div className="flex-1 flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow space-y-6">
					<div className="text-center space-y-2">
						<h2 className="text-2xl font-bold text-black ">
							Login to Insurance Dashboard & Analytics
						</h2>
						<p className="text-sm text-muted-foreground text-gray-500">
							Login in seconds. No credit card required.
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
						<Button
							type="submit"
							className="w-full btn-primary"
							disabled={loading}
							size="lg"
						>
							{loading ? "Logging in..." : "Login"}
						</Button>
					</form>
					<div className="text-sm text-black flex flex-col items-center gap-1">
						<p>
							<span>Forgot password?</span>{" "}
							<Link
								href="/forgot-password"
								className="text-primary font-medium"
							>
								Reset here
							</Link>
						</p>
						<p>
							<span>Don't have an account?</span>{" "}
							<Link href="/signup" className="text-primary font-medium">
								Sign up here
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
