import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "undiegravity_session";

const PUBLIC_PATHS = new Set([
  "/login",
  "/api/auth/login",
  "/favicon.ico",
  "/icon.png",
  "/apple-icon.png",
  "/logo.png",
]);

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Allow public routes and static assets
  if (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (hasSessionCookie) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|logo.png|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)",
  ],
};
