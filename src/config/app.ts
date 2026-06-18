import { Metadata } from 'next';

import { env } from '@/env';

export const appConfig = {
  title: 'VESTAFI',
  description:
    'VESTAFI - Making real estate ownership simple, profitable & accessible across East Africa',
  keywords: 'vestafi, real estate, investment, platform',
  logo: '/logo/main.png',
  defaultLocale: 'en-UG',
  defaultCurrency: 'UGX',
  defaultCountryCode: 'UG',
  appUrl: env.NEXT_PUBLIC_APP_URL,
  emails: {
    support: 'hq@vestafi.co',
    sender: 'hq@vestafi.co',
    admin: env.NEXT_PUBLIC_ADMIN_EMAIL!,
  },
  phone: {
    whatsapp: '+256 765 578126',
    local: '+256 765 578126',
    vestafi_phone: '+256 748082669',
    vestafi_whatsapp: '+256 748082669',
  },
} as const;

export const businessConfig = {
  minSpendForInvestment: 1_000_000,
  minInvestmentAmount: 1_000_000,
  minVaultDeposit: 500_000,
  minVaultDeployment: 1_000_000,
} as const;

export const membershipConfig = {
  // Default annual fee (can be overridden by app_settings table)
  defaultAnnualFee: 70_000, // UGX
  durationMonths: 12,
  // Note: membership_enabled and actual fee amount are stored in app_settings table
  // and can be changed by admins without code updates
} as const;

export type NotificationTheme = 'info' | 'warning' | 'success' | 'error';

export interface AdminNotification {
  message: string;
  expiresAt: string; // ISO datetime string
  theme: NotificationTheme;
}

export const notificationThemes: Record<
  NotificationTheme,
  {
    label: string;
    bgClass: string;
    textClass: string;
    iconClass: string;
  }
> = {
  info: {
    label: 'Info (Blue)',
    bgClass: 'bg-blue-50 dark:bg-blue-950',
    textClass: 'text-blue-900 dark:text-blue-100',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    label: 'Warning (Amber)',
    bgClass: 'bg-amber-50 dark:bg-amber-950',
    textClass: 'text-amber-900 dark:text-amber-100',
    iconClass: 'text-amber-600 dark:text-amber-400',
  },
  success: {
    label: 'Success (Green)',
    bgClass: 'bg-green-50 dark:bg-green-950',
    textClass: 'text-green-900 dark:text-green-100',
    iconClass: 'text-green-600 dark:text-green-400',
  },
  error: {
    label: 'Error (Red)',
    bgClass: 'bg-red-50 dark:bg-red-950',
    textClass: 'text-red-900 dark:text-red-100',
    iconClass: 'text-red-600 dark:text-red-400',
  },
} as const;

export default function getMetadata(): Metadata {
  return {
    metadataBase: new URL(appConfig.appUrl),
    title: { template: `%s | ${appConfig.title}`, default: appConfig.title },
    description: appConfig.description,
    robots: { index: true, follow: true },
    // icons: {
    //   icon: '/favicon/favicon.ico',
    //   shortcut: '/favicon/favicon-16x16.png',
    //   apple: '/favicon/apple-touch-icon.png',
    // },
    // manifest: `/favicon/site.webmanifest`,

    openGraph: {
      url: appConfig.appUrl,
      title: appConfig.title,
      description: appConfig.description,
      siteName: appConfig.title,
      images: [`/main/logo.png`],
      type: 'website',
      locale: 'en_UG',
    },

    twitter: {
      card: 'summary_large_image',
      title: appConfig.title,
      description: appConfig.description,
      images: [`/main/logo.png`],
    },
    keywords: ['investment property', 'real estate', 'property investment'],
  };
}
