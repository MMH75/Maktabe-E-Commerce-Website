import { NextResponse, type NextRequest } from "next/server";
import { readSession, SESSION_COOKIE } from "@/lib/session";

// Sends visitors without a valid admin session to the login page.
// This is a convenience redirect only; each admin server action also calls
// requireAdmin() (src/lib/auth.ts), which is the real protection.
export async function proxy(request: NextRequest) {
  // Server action calls are POSTs; a plain redirect here would break them.
  // They are checked by requireAdmin() instead, which redirects correctly.
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();

  const { pathname } = request.nextUrl;
  const session = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
  const onLoginPage = pathname === "/admin/login";

  if (!session && !onLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (session && onLoginPage) {
    return NextResponse.redirect(new URL("/admin/products", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
