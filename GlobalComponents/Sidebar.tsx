// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Users, Settings } from "lucide-react";

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
	policy_holder: [{ name: "Dashboard", path: "/", icon: Home }],
} as const;

type Role = keyof typeof sidebarItemsByRole;

export default function Sidebar({ role }: { role: Role }) {
	const pathname = usePathname();
	const items = sidebarItemsByRole[role];

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
			</ul>
		</aside>
	);
}
