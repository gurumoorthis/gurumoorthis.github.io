"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, FileText, Users, Settings, LogOut } from "lucide-react";
import secureLocalStorage from "react-secure-storage";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { getToastOptions } from "@/utils/getToastOptions";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const sidebarItemsByRole = {
	admin: [
		{ name: "Dashboard", path: "/", icon: Home },
		{ name: "Policies", path: "/policies", icon: FileText },
		{ name: "Policyholders", path: "/policyholders", icon: Users },
		{ name: "Settings", path: "/settings", icon: Settings },
	],
	agent: [
		{ name: "Dashboard", path: "/", icon: Home },
		{ name: "Policies", path: "/policies", icon: FileText },
	],
	policy_holder: [
		{ name: "Dashboard", path: "/", icon: Home },
		{ name: "Policies", path: "/policies", icon: FileText },
	],
} as const;

type Role = keyof typeof sidebarItemsByRole;

export default function Sidebar({ role }: { role: Role }) {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	const router = useRouter();
	const dispatch = useDispatch();
	const items = sidebarItemsByRole[role];

	function handleLogout() {
		secureLocalStorage.clear();
		dispatch({ type: "RESET_APP" });
		document.cookie = "access_token=; Max-Age=0; path=/; SameSite=Strict;";
		document.cookie = "refresh_token=; Max-Age=0; path=/; SameSite=Strict;";
		router.push("/login");
		toast.success("Logged out", getToastOptions());
	}

	return (
		<aside className="fixed top-0 left-0 w-64 h-screen bg-gray-800 text-white p-4 overflow-y-auto shadow">
			<h2 className="text-xl font-bold mb-6">Menu</h2>
			<ul className="space-y-3">
				{items.map((item) => {
					const Icon = item.icon;
					return (
						<li key={item.path}>
							<Link
								href={item.path}
								className={`flex items-center gap-3 p-2 rounded transition ${
									pathname === item.path
										? "text-primary bg-gray-700"
										: "hover:text-gray-300 hover:bg-gray-700"
								}`}
							>
								<Icon className="w-5 h-5" />
								<span>{item.name}</span>
							</Link>
						</li>
					);
				})}
				<li key="logout">
					{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
					<button
						onClick={() => setOpen(true)}
						className="flex items-center gap-3 p-2 rounded w-full text-left hover:text-gray-300 hover:bg-gray-700 transition"
					>
						<LogOut className="w-5 h-5" />
						<span>Logout</span>
					</button>
				</li>
			</ul>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md bg-white border-0">
					<DialogHeader>
						<DialogTitle>Confirm Logout</DialogTitle>
						<DialogDescription>
							Are you sure you want to log out?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button className="btn-primary" onClick={handleLogout}>
							Yes, Logout
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</aside>
	);
}
