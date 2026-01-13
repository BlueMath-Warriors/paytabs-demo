// proxy.js
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  
  // Allow access to auth pages - no auth check needed
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return NextResponse.next()
  }

  // Allow root page
  if (pathname === "/") {
    return NextResponse.next()
  }

  // Allow standalone payment-result page without auth 
  // This page is accessed after PayTabs redirect so user may not have session cookie
  if (pathname.startsWith("/payment-result")) {
    return NextResponse.next()
  }

  // Protect dashboard routes - redirect to login if not authenticated
  if (pathname.startsWith("/dashboard")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // All routes pass through (including dashboard if authenticated)
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes are handled separately in route handlers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.svg (SVG files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)",
  ],
}