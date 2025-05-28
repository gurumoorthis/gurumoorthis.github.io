"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Home, FileText, Users, LogOut, Menu, CircleUser } from "lucide-react";
import secureLocalStorage from "react-secure-storage";
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
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/redux/store";
import { toTitleCase } from "@/utils/toTileCase";

export const sidebarItemsByRole = {
	admin: [
		{ name: "Dashboard", path: "/", icon: Home },
		{ name: "Policies", path: "/policies", icon: FileText },
		{ name: "Users", path: "/users", icon: Users },
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
	const [openSidebar, setOpenSidebar] = useState(false);
	const pathname = usePathname();
	const router = useRouter();
	const dispatch = useDispatch();
	const items = sidebarItemsByRole[role];
	const { userDetails } = useSelector((state: RootState) => state.AUTH);
	const handleLogout = () => {
		secureLocalStorage.clear();
		dispatch({ type: "RESET_APP" });
		document.cookie = "access_token=; Max-Age=0; path=/;";
		document.cookie = "refresh_token=; Max-Age=0; path=/;";
		document.cookie = "role=; Max-Age=0; path=/;";
		router.push("/login");
		toast.success("Logged out", getToastOptions());
	};

	const SidebarContent = () => (
		<div className="p-6 space-y-6 bg-gray-900 text-gray-100 min-h-screen w-64">
			<div>
				<h2 className="text-2xl font-semibold mb-2 pb-2">User Profile</h2>
				<div className="flex items-center gap-4">
					<CircleUser size={48} strokeWidth={1} className="text-primary" />
					<div>
						<p className="text-lg font-medium">{userDetails.name}</p>
						<p className="capitalize text-sm text-gray-400">
							{toTitleCase(userDetails.roles?.name)}
						</p>
					</div>
				</div>
			</div>
			<div className="border-b border-gray-700" />
			<nav>
				<h2 className="text-2xl font-semibold mb-3 pb-2">Menu</h2>
				<ul className="space-y-2">
					{items?.map((item) => {
						const Icon = item.icon;
						const active = pathname === item.path;
						return (
							<li key={item.path}>
								<Link
									href={item.path}
									className={`flex items-center gap-3 px-4 py-2 rounded-lg transition
                ${active ? "bg-primary text-white shadow-md" : "hover:bg-gray-800 hover:text-white"}
              `}
									onClick={() => setOpenSidebar(false)}
									aria-current={active ? "page" : undefined}
								>
									<Icon
										className={`w-5 h-5 ${active ? "text-white" : "text-gray-400"}`}
									/>
									<span className="font-medium">{item.name}</span>
								</Link>
							</li>
						);
					})}
					<li>
						<button
							onClick={() => setOpen(true)}
							className="flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left hover:bg-red-700 hover:text-white transition font-medium text-red-400"
							type="button"
						>
							<LogOut className="w-5 h-5" />
							<span>Logout</span>
						</button>
					</li>
				</ul>
			</nav>
		</div>
	);

	return (
		<>
			{/* Mobile Sheet Trigger */}
			<div className="sm:hidden">
				<Sheet open={openSidebar}>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							size={"icon"}
							onClick={() => {
								setOpenSidebar(true);
							}}
						>
							<Menu />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="bg-gray-800 text-white w-64">
						<SidebarContent />
					</SheetContent>
				</Sheet>
			</div>

			{/* Desktop Sidebar */}
			<aside className="hidden sm:block fixed top-0 left-0 w-64 h-screen bg-gray-800 text-white shadow overflow-y-auto">
				<SidebarContent />
			</aside>

			{/* Logout Confirmation Dialog */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Logout</DialogTitle>
						<DialogDescription>
							Are you sure you want to log out?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button className="btn-primary" onClick={handleLogout}>
							Logout
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
