# Vestafi Deployment

This project is a Next.js application deployed to Vercel with Supabase and Resend.

## Staging Target

- GitHub repository: `https://github.com/agentcityy-products/Vestafi.org`
- Vercel domain: `https://www.codex.vestafi.org`
- Supabase project URL: `https://hyzmrvccsekfmvaenisa.supabase.co`

## Build Settings

- Package manager: `pnpm`
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output: Next.js default Vercel output
- Node runtime: use the Vercel default compatible with Next.js 15

## Required Environment Variables

Configure these in Vercel for the staging environment:

| Variable                        | Scope         | Notes                                                                |
| ------------------------------- | ------------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Client/server | `https://hyzmrvccsekfmvaenisa.supabase.co`                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client/server | Supabase anon public key                                             |
| `SUPABASE_SERVICE_KEY`          | Server only   | Supabase service role key; never expose to browser                   |
| `RESEND_API_KEY`                | Server only   | Resend API key for transactional email                               |
| `CRON_SECRET`                   | Server only   | Random value (32+ characters) used to authorize scheduled email jobs |
| `NEXT_PUBLIC_ADMIN_EMAIL`       | Client/server | Admin email used by app config                                       |
| `NEXT_PUBLIC_APP_URL`           | Client/server | `https://www.codex.vestafi.org`                                      |
| `NEXT_PUBLIC_POSTHOG_KEY`       | Client/server | Optional                                                             |
| `NEXT_PUBLIC_POSTHOG_HOST`      | Client/server | Optional                                                             |

## DNS

After adding `www.codex.vestafi.org` to the Vercel project, Vercel will show the exact DNS target. The common setup for a `www` subdomain is:

```text
Type: CNAME
Name: www.codex
Value: cname.vercel-dns.com
```

Use the exact value Vercel displays if it differs.

## Supabase

Do not reset or wipe the linked Supabase project without explicit approval. Validate migrations against staging before applying destructive changes. Storage setup lives under `supabase/migrations`.

## Verification Checklist

- Homepage loads.
- Auth pages load.
- Onboarding route loads.
- Dashboard routes redirect or protect unauthenticated users.
- Admin routes enforce protection.
- Supabase requests connect to the staging project.
- Email actions do not crash when invoked.
- No secrets are present in committed files.
