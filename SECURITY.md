# Security Policy

Vestafi handles authentication, investment, banking-adjacent, and administrative workflows. Treat every environment as sensitive, including staging.

## Secret Handling

- Never commit `.env`, `.env.local`, `.env.production`, Supabase service role keys, Resend API keys, database URLs, JWT secrets, or provider credentials.
- Store deployment secrets only in Vercel environment variables, Supabase project settings, GitHub secrets, or the relevant provider dashboard.
- Browser-exposed variables must use `NEXT_PUBLIC_` and must be safe for public disclosure.
- `SUPABASE_SERVICE_KEY` must be available only to trusted server-side code and must never be sent to the browser.

## Required Rotation

Rotate credentials immediately if a key is exposed in source control, logs, screenshots, support tickets, browser bundles, or third-party tooling.

## Reporting

Report suspected issues privately to the project owner. Include affected route/API, reproduction steps, and impact. Do not include live secrets in reports.

## Staging Baseline

Before promoting staging changes, verify:

- No `.env*` files are committed.
- No Supabase service role key is present in browser bundles or client components.
- RLS policies protect user-owned records.
- Admin routes enforce role checks server-side.
- Email-sending paths fail closed when provider credentials are missing.
