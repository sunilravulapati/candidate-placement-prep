// src/middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

// All routes are open for local development and database testing.
export default clerkMiddleware(async (auth, request) => {
  // No routes are protected by default for now
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.[\\w]+$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
