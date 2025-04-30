// this file runs before our app runns
//if we want to initialise our authentication and configure our authentication before our app is starting
//for example if we want to protect any page from public access we can define here

import arcjet, { createMiddleware, detectBot, shield } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

//anything that comes after the /admin will be private route
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/saved-cars(.*)',
  '/reservations(.*)',
]);

// protecting our app from external attack using arcjet
// Create Arcjet middleware
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  // characteristics: ["userId"], // Track based on Clerk userId
  rules: [
    // Shield protection for content and security
    shield({
      mode: 'LIVE',
    }),
    detectBot({
      mode: 'LIVE', // will block requests. Use "DRY_RUN" to log only
      // allowing search engines
      allow: [
        'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc
        // See the full list at https://arcjet.com/bot-list
      ],
    }),
  ],
});

// check whether user is logged in or not
const clerk = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  //    if the user is not logged in also if the is in protected route  redirect to sign in page
  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

export default createMiddleware(aj, clerk);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
