# Vestafi

Vestafi is a Next.js and Supabase application for real estate investment workflows, onboarding, dashboards, admin operations, vault activity, referrals, and transactional email.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Resend
- TanStack Query
- pnpm

## Getting Started

Install dependencies:

```bash
pnpm install
```

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

Fill in local values in `.env.local`. Do not commit real secrets.

Run development:

```bash
pnpm dev
```

Run checks:

```bash
pnpm typecheck
pnpm build
```

## Environment Variables

See [.env.example](./.env.example) for the complete staging-oriented list.

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `RESEND_API_KEY`
- `CRON_SECRET`
- `NEXT_PUBLIC_ADMIN_EMAIL`
- `NEXT_PUBLIC_APP_URL`

Optional:

- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md).

## Security

See [SECURITY.md](./SECURITY.md). Never commit `.env*` files or provider credentials.
