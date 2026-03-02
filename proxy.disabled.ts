
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookieKey } from "./stores/auth.store";


export async function proxy(request: NextRequest) {
    const accessToken = request.cookies.get(cookieKey)?.value;
    const { pathname } = request.nextUrl;

    // Detect if the first segment is an OrgId (UUID format)
    // Common UUID regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pathSegments = pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0];

    const isOrgRoute = firstSegment && uuidRegex.test(firstSegment);
    const isDashboardRoute = pathname.startsWith("/dashboard");

    // Protect Dashboard and Org Routes
    if (isDashboardRoute || isOrgRoute) {
        if (!accessToken) {
            // Redirect to login if not authenticated
            // Adjust login URL as needed, e.g. /auth/login or /login
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
    }

    // Validate Org Membership via Internal API
    if (isOrgRoute && accessToken) {
        try {
            // Use process.env.NEXT_PUBLIC_BASE_URL for API
            // Note: In Middleware, process.env is available at build time, 
            // ensure it's available in runtime or fallback.
            const apiBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/api";

            // Adjust endpoint path if necessary. routes.organization.index is "/organization"
            const response = await fetch(`${apiBaseUrl}/organization`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                // Handle different response structures (array or paginated)
                let organizations: any[] = [];
                if (Array.isArray(data)) {
                    organizations = data;
                } else if (data.results && Array.isArray(data.results)) {
                    organizations = data.results;
                }

                const orgId = firstSegment;
                const hasAccess = organizations.some((member: any) => member.organization?.id === orgId);

                if (!hasAccess) {
                    // User is not a member of this organization
                    // Redirect to a selection page or default dashboard
                    return NextResponse.redirect(new URL("/dashboard", request.url));
                }
            } else {
                // API Error (e.g. 401 expired)
                if (response.status === 401) {
                    return NextResponse.redirect(new URL("/auth/login", request.url));
                }
                // Allow or block? Block is safer.
                // return NextResponse.redirect(new URL("/dashboard", request.url));
            }
        } catch (error) {
            console.error("Middleware API Check Error", error);
            // On error preventing verification, assume no access
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/((?!api|_next/static|_next/image|favicon.ico|auth).*)", // Match all strictly to catch /[orgId]
    ],
};
