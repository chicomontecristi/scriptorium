import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";

// ─── TINTAXIS MIDDLEWARE ──────────────────────────────────────────────────────
// Protects /author/* routes — redirects to login if no valid session.

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /author routes except /author/login
  if (pathname.startsWith("/author") && !pathname.startsWith("/author/login")) {
    const cookieHeader = req.headers.get("cookie");
    const session = getSessionFromCookie(cookieHeader);

    if (!session || session.role !== "author") {
      const loginUrl = new URL("/author/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/author/:path*"],
};
