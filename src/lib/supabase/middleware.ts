import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

import Logger from '@/utils/logger';

import { paths } from '@/constants/paths';
import { env } from '@/env';

import { Database } from '@/types/supabase';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // refreshing the auth token
  /*
  REDIRECT RULES:
  1. If user is not authenticated and the path is not /auth/login, redirect to /auth/login
  2. If user is authenticated and the path is /auth/login, redirect to /dashboard
  3. If user is authenticated and user_metadata.onboarded is false, redirect to /onboarding
  4. If user is admin and the path does not start with /admin, redirect to /admin/properties
  5. If user is not admin and the path starts with /admin, redirect to /dashboard
  */

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Rule 1: Guest users are allowed on guestRoutes only
  if (!user) {
    if (!isUserAllowed(guestRoutes, pathname)) {
      Logger.info('Redirecting guest user to login');
      return NextResponse.redirect(new URL(paths.auth.login, request.url));
    }
    return supabaseResponse;
  }

  // User is authenticated from here
  const isOnboarded = user.user_metadata.onboarded;
  const isAdmin = user.user_metadata.role === 'admin';

  // Rule 2: Not onboarded users are allowed on guestRoutes and onboarding page only
  if (!isOnboarded) {
    if (
      !isUserAllowed(guestRoutes, pathname) &&
      pathname !== paths.onboarding
    ) {
      Logger.info('Redirecting non-onboarded user to onboarding');
      return NextResponse.redirect(new URL(paths.onboarding, request.url));
    }
    return supabaseResponse;
  }

  // Rule 3: Admin is allowed on adminRoutes only
  if (isAdmin) {
    if (!isUserAllowed(adminRoutes, pathname)) {
      Logger.info('Redirecting admin to admin area');
      return NextResponse.redirect(
        new URL(paths.admin.properties.list, request.url),
      );
    }
    return supabaseResponse;
  }

  // Rule 4: Onboarded user is allowed on userRoutes only
  if (!isUserAllowed(userRoutes, pathname)) {
    Logger.info('Redirecting user to dashboard');
    return NextResponse.redirect(new URL(paths.dashboard.root, request.url));
  }

  return supabaseResponse;
}

const publicRoutes = [
  '/email',
  '/pdf',
  paths.home,
  paths.legal.privacy,
  paths.legal.terms,
  paths.rentalProperties.list,
  paths.howItWorks,
  paths.about,
] as string[];

const guestRoutes = [paths.auth.login, paths.auth.apply] as string[];

const adminRoutes = [
  paths.admin.root,
  paths.profile,
  paths.admin.rentalProperties.list,
] as string[];

const userRoutes = [
  paths.profile,
  paths.dashboard.savingsOverview,
  paths.listings.list,
  paths.rentalProperties.submit,
  paths.dashboard.vault,
  paths.dashboard.innerAccess,
] as string[];

const isUserAllowed = (allowedPaths: string[], pathname: string) => {
  return (
    allowedPaths.some((path) => pathname.startsWith(path)) ||
    publicRoutes.includes(pathname)
  );
};
