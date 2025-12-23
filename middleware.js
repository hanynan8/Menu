// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (token && (pathname === "/api/auth/signin" || pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (token && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (token && pathname.startsWith("/register")) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  if (!token && pathname.startsWith("/pay")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/api/auth/signin", "/api/auth/AuthButtons/signin", '/', '/register', '/login', '/pay'],
};
