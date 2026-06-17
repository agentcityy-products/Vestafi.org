'use client';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

import { env } from '@/env';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!env.NEXT_PUBLIC_POSTHOG_KEY) return;
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
      ui_host: env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      capture_pageleave: true,
      person_profiles: 'always', // or 'always' to create profiles for anonymous users as well
      autocapture: true, // Automatically captures clicks & other interactions
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
