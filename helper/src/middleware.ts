// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/dsa(.*)',
  '/resume-studio(.*)',
  '/resume-ai(.*)',
  '/resume-editor(.*)',
  '/resume-tailoring(.*)',
  '/mock-interviews(.*)',
  '/aptitude(.*)',
  '/analytics(.*)',
  '/history(.*)',
  '/knowledge(.*)',
  '/knowledge-hub(.*)',
  '/onboarding(.*)',
]);

const isAuthPage = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const url = request.nextUrl;

  // If authenticated user accesses landing, sign-in, or sign-up, redirect to dashboard
  if (userId && isAuthPage(request)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If unauthenticated user tries to access protected route, redirect to sign-in
  if (!userId && isProtectedRoute(request)) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.\\w+$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
