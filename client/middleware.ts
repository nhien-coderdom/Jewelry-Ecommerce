import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware để chặn người dùng mở trang Clerk Hosted UI
export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // Chặn /user/* và /account/*
  if (url.startsWith("/user") || url.startsWith("/account")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/(api|trpc)(.*)",
  ],
};
