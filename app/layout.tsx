"use client";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Role } from "@/GlobalComponents/types";
import secureLocalStorage from "react-secure-storage";
import Sidebar from "@/GlobalComponents/Sidebar";
import { Toaster } from "sonner";
import ReduxProvider from "@/ReduxProvider";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const pathname = usePathname();
	const [role, setRole] = useState<Role | null>(null);

	// List of pages where the sidebar should be shown
	const sidebarPages = [
		"/dashboard",
		"/policies",
		"/policyholders",
		"/settings",
	];
	const showSidebar = sidebarPages.some((page) => pathname.startsWith(page));

	useEffect(() => {
		const storedRole = secureLocalStorage.getItem("userRole") as Role | null;
		if (storedRole) {
			setRole(storedRole);
		}
	}, []);

	return (
		<html lang="en">
			<body>
				<Toaster />
				<ReduxProvider>
					<AppProvider>
						{showSidebar && role ? (
							<div className="flex">
								<Sidebar role={role} />
								<main className="ml-64 flex-1 p-8 overflow-y-auto h-screen">
									{children}
								</main>
							</div>
						) : (
							<>{children}</>
						)}
					</AppProvider>
				</ReduxProvider>
			</body>
		</html>
	);
}
