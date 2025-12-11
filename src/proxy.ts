import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextProxy } from 'next/server';
import { verifyBasicAuth, createBasicAuthResponse } from '@utils/basicAuth';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isProtectedRoute = createRouteMatcher(['/investor(.*)', '/onboarding', '/admin(.*)']);
const isPublicRoute = createRouteMatcher([
  '/root',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/sso-callback',
  '/privacy-policy',
  '/terms-and-conditions',
  '/home',
  '/.well-known(.*)',
]);

const handler = clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  const isApi = path.startsWith('/api') || path.startsWith('/trpc');
  const isAuthCallback = path.startsWith('/sso-callback');
  const methodIsGet = req.method === 'GET';

  if (isAdminRoute(req)) {
    if (!verifyBasicAuth(req)) {
      return createBasicAuthResponse();
    }
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  if (!userId && !isPublicRoute(req) && !isApi) {
    url.pathname = '/sign-up';
    return NextResponse.redirect(url);
  }

  // if (isAdminRoute(req)) {
  //   const role = sessionClaims?.metadata?.role
  //   if (role !== 'admin') {
  //     url.pathname = '/'
  //     return NextResponse.redirect(url)
  //   }
  // }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (userId && !isApi && methodIsGet && !isAuthCallback) {
    if (path === '/onboarding') {
      return;
    }
  }

  return;
});

export default handler satisfies NextProxy;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
