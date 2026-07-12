import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { Session, User } from 'better-auth';

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const sessionDataToken =
    request.cookies.get('__Secure-better-auth.session_data')?.value ??
    request.cookies.get('better-auth.session_data')?.value;

  let decodedSession = null;
  if (sessionDataToken) {
    try {
      // Decode base64 string
      const decoded = Buffer.from(sessionDataToken, 'base64').toString('utf-8');
      decodedSession = JSON.parse(decoded) as {
        session: {
          session: Session;
          user: User & { isFirstLogin?: boolean };
        };
      };
    } catch (error) {
      console.error('Failed to decode session:', error);
    }
  }

  // No session cookie → redirect to sign-in
  if (!sessionCookie) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signInUrl);
  }

  const pathname = request.nextUrl.pathname;

  // Onboarding gate: first-login users must complete onboarding before
  // accessing any other hub route. Handled here (not in the hub layouts) so
  // those layouts stay static and can prerender their PPR shell.
  // `completeOnboardingAction` refreshes the session cookie, so once
  // onboarding is done `isFirstLogin` flips to false on the next request.
  if (
    decodedSession?.session?.user?.isFirstLogin === true &&
    pathname !== '/hub/onboarding'
  ) {
    return NextResponse.redirect(new URL('/hub/onboarding', request.url));
  }

  // Get user email for role-based restrictions
  const userEmail = decodedSession?.session?.user?.email?.toLowerCase() ?? '';
  const isGuest = userEmail.includes('guest');
  const isEmployee = userEmail.includes('employee');

  // Guest restrictions
  if (isGuest) {
    const restrictedGuestRoutes = [
      '/hub/fairteiler/dashboard',
      '/hub/fairteiler/profile',
      '/hub/fairteiler/members',
      '/hub/fairteiler/preferences',
    ];

    if (restrictedGuestRoutes.some((route) => pathname.includes(route))) {
      return NextResponse.redirect(
        new URL('/hub/fairteiler/contribution', request.url),
      );
    }
  }

  // Employee restrictions
  if (isEmployee) {
    const restrictedEmployeeRoutes = [
      '/hub/fairteiler/profile',
      '/hub/fairteiler/members',
      '/hub/fairteiler/preferences',
    ];

    if (restrictedEmployeeRoutes.some((route) => pathname.includes(route))) {
      return NextResponse.redirect(
        new URL('/hub/fairteiler/dashboard', request.url),
      );
    }
  }

  // Handle other specific redirects if the user is authenticated
  if (request.url === `${process.env.NEXT_PUBLIC_ENV_URL}/hub`) {
    return NextResponse.redirect(new URL('/hub/user/dashboard', request.url));
  }
  if (request.url === `${process.env.NEXT_PUBLIC_ENV_URL}/hub/fairteiler`) {
    // Guests should go to contribution, others to dashboard
    const redirectPath = isGuest
      ? '/hub/fairteiler/contribution'
      : '/hub/fairteiler/dashboard';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
  if (request.url === `${process.env.NEXT_PUBLIC_ENV_URL}/hub/user`) {
    return NextResponse.redirect(new URL('/hub/user/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/hub/:path*'],
};
