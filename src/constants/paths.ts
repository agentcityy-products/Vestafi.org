import { appConfig } from '@/config/app';

export const paths = {
  home: '/',
  auth: {
    login: '/auth/login',
    callback: '/auth/callback',
    apply: '/apply',
  },
  onboarding: '/onboarding',
  profile: '/profile',
  listings: {
    list: '/listings',
    detail: (id: string) => `/listings/${id}`,
  },
  rentalProperties: {
    list: '/appartments',
    submit: '/submit',
  },
  dashboard: {
    root: '/listings',
    savingsOverview: '/dashboard',
    contributions: '/dashboard/contributions',
    withdrawals: '/dashboard/withdrawals',
    vault: '/dashboard/vault',
    referrals: '/dashboard/referrals',
    innerAccess: '/dashboard/inner-access',
    exitWindow: {
      root: '/dashboard/exit-window',
      sell: '/dashboard/exit-window/sell',
      buy: '/dashboard/exit-window/buy',
      buyProperty: (propertyId: string) =>
        `/dashboard/exit-window/buy/property/${propertyId}`,
      sellProperty: (propertyId: string) =>
        `/dashboard/exit-window/sell/property/${propertyId}`,
    },
  },
  admin: {
    root: '/admin',
    properties: {
      list: '/admin/properties',
      form: (id?: string) => `/admin/properties/form${id ? `?id=${id}` : ''}`,
      detail: (id: string) => `/admin/properties/${id}`,
    },
    rentalProperties: {
      list: '/admin/rental-properties',
    },
    pendingInvestments: '/admin/pending-investments',
    withdrawalRequests: '/admin/withdrawal-requests',
    vault: '/admin/vault',
    memberships: '/admin/memberships',
    referrals: '/admin/referrals',
    reports: '/admin/reports',
    settings: '/admin/settings',
    exitWindows: '/admin/exit-windows',
    exitWindowForm: (id?: string) =>
      `/admin/exit-windows/form${id ? `?id=${id}` : ''}`,
  },
  legal: {
    privacy: '/legal/privacy',
    terms: '/legal/terms',
  },
  howItWorks: '/how-it-works',
  about: '/about',
  support: `mailto:${appConfig.emails.support}`,
} as const;
