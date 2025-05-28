// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Role = "admin" | "agent" | "policy_holder";

function isRole(value: string | undefined): value is Role {
	return value === "admin" || value === "agent" || value === "policy_holder";
}

const publicPaths = [
	"/login",
	"/signup",
	"/forgot-password",
	"/api",
	"/favicon.ico",
];

// Define allowed routes per role
const roleBasedRoutes: Record<Role, string[]> = {
	admin: ["/", "/policies", "/users"],
	agent: ["/", "/policies"],
	policy_holder: ["/", "/policies"],
};

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	if (
		publicPaths.some((path) => pathname.startsWith(path)) ||
		pathname.startsWith("/_next")
	) {
		return NextResponse.next();
	}
	const token = request.cookies.get("access_token")?.value;
	if (!token) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
	const role = request.cookies.get("role")?.value;

	if (!isRole(role)) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
	const allowedPaths = roleBasedRoutes[role];
	const isAllowed = allowedPaths.some((path) => pathname === path);

	if (!isAllowed) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	// User is authorized — continue
	return NextResponse.next();
}
