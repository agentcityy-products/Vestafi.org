import type { NextConfig } from 'next';

const supabaseImageHost = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
  'https://',
  '',
);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://eu.i.posthog.com/decide',
      },
    ];
  },
  images: {
    remotePatterns: [
      ...(supabaseImageHost
        ? [
            {
              protocol: 'https' as const,
              hostname: supabaseImageHost,
              pathname: '**',
            },
          ]
        : []),
      ...['flagsapi.com', 's3.amazonaws.com', 'res.cloudinary.com'].map(
        (domain) => ({
          protocol: 'https' as const,
          hostname: domain,
          pathname: '**',
        }),
      ),
    ],
  },
};

export default nextConfig;
