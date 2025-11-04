// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { verifyBasicAuth, createBasicAuthResponse } from '@utils/basicAuth'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isProtectedRoute = createRouteMatcher(['/investor(.*)', '/onboarding', '/admin(.*)'])
const isPublicRoute = createRouteMatcher(['/sign-in', '/sign-up', '/forgot-password', '/sso-callback', '/privacy-policy', '/terms-and-conditions', '/home', '/.well-known(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url)
  const path = url.pathname

  // Helpers
  const isApi = path.startsWith('/api') || path.startsWith('/trpc')
  const isAuthCallback = path.startsWith('/sso-callback')
  const methodIsGet = req.method === 'GET'

  // 1) Handle admin routes with Basic Authentication (bypass Clerk completely)
  if (isAdminRoute(req)) {
    if (!verifyBasicAuth(req)) {
      return createBasicAuthResponse();
    }
    // If basic auth passes, allow access to admin routes
    return NextResponse.next();
  }

  // 2) For non-admin routes, continue with Clerk authentication
  const { userId, sessionClaims } = await auth()

  // 3) Redirect unauthenticated users to sign-up (except for public routes)
  if (!userId && !isPublicRoute(req) && !isApi) {
    url.pathname = '/sign-up'
    return NextResponse.redirect(url)
  }

  // 2) Admin gate
  // if (isAdminRoute(req)) {
  //   const role = sessionClaims?.metadata?.role
  //   if (role !== 'admin') {
  //     url.pathname = '/'
  //     return NextResponse.redirect(url)
  //   }
  // }

  // 3) Protect selected pages (auth required)
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  // 4) Onboarding gate for signed-in users (pages only; no API/POST redirects)
  if (userId && !isApi && methodIsGet && !isAuthCallback) {
    // Check if user is already on onboarding page to avoid loops
    if (path === '/onboarding') {
      // User is on onboarding page, let them stay there
      return
    }
    
    // For other pages, check if onboarding is required
    // We'll let the onboarding page handle the redirect logic
    // This prevents middleware loops while still protecting routes
  }

  // Fall through
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}