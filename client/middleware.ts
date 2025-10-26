import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// TEMPORARILY DISABLED - Clerk middleware causing clock skew issues
// Simple passthrough middleware until Clerk is re-enabled
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/(api|trpc)(.*)",
  ],
}
