# Minecraft Hosting

Premium game server hosting platform built with Next.js — landing pages, authentication, dashboard, server creation, cart/checkout, and account settings with email-based 2FA.

## Features

- **Public pages:** Home, Plans, Features, Login, Sign Up
- **Authenticated pages:** Dashboard, Create Server, Settings, Cart, Checkout
- **Auth:** Sign up / login with session cookies, bcrypt password hashing
- **2FA:** Email-based 6-digit codes (logged to console in dev mode)
- **Database:** PostgreSQL + Prisma (users, servers, plans, cart, 2FA codes)
- **Mobile-first:** Responsive layout on every page

## Prerequisites

- Node.js 18+
- npm, pnpm, or yarn
- PostgreSQL database (local, [Neon](https://neon.tech), [Supabase](https://supabase.com), or Vercel Postgres)

## Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (pooled URL on Neon/Vercel) |
| `DIRECT_URL` | Optional. Direct PostgreSQL URL for migrations; defaults to `DATABASE_URL` if omitted |
| `AUTH_SECRET` | Random string for session signing (required in production) |
| `DEV_LOG_2FA` | Set to `true` to print 2FA codes in the terminal instead of email |
| `SMTP_*` | Optional SMTP settings for sending 2FA emails in production |

3. **Initialize database and seed plans**

```bash
npm run db:setup
```

This runs migrations and seeds the plan catalog (Free, Zombie, Wither, Ender Dragon, Diamond).

4. **Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 2FA in development

With `DEV_LOG_2FA=true` (the default), verification codes are printed to your terminal when you log in with 2FA enabled:

```
--- 2FA Email (dev mode) ---
To: user@example.com
Subject: Your Minecraft Hosting verification code
Your verification code is: 123456
```

Enable 2FA under **Settings → Two-Factor Auth**, then log out and log back in to test the flow.

## Production email (optional)

To send real 2FA emails, set:

```
DEV_LOG_2FA=false
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASS=your-password
SMTP_FROM=Minecraft Hosting <noreply@yourdomain.com>
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Run migrations, generate Prisma client, and build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema changes without a migration (dev only) |
| `npm run db:seed` | Seed plan catalog |
| `npm run db:setup` | Apply migrations + seed |

## Deploying to Vercel

1. Create a PostgreSQL database (Vercel Postgres, Neon, or Supabase).
2. Import the repo in Vercel — framework preset **Next.js** is auto-detected.
3. Set environment variables: `DATABASE_URL`, `AUTH_SECRET`, and optional `DIRECT_URL` / SMTP settings.
4. Build settings (defaults work; explicit values below):

| Setting | Value |
|---------|--------|
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | *(leave empty)* |
| Development Command | `npm run dev` |

5. Deploy — the build runs `prisma migrate deploy` to apply the schema, then seeds plans once locally or via `npm run db:seed` against your production database.

## User flow

1. Browse **Plans** → choose a plan (redirects to Sign Up if logged out)
2. **Sign Up** → auto-login → **Dashboard** (selected plan added to cart)
3. **Create Server** → fill form → provisioning animation → server saved → Dashboard
4. **Settings** → update profile, password, or enable 2FA
5. **Cart → Checkout** → mock payment for paid plans, free plans skip payment

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Prisma + PostgreSQL
- jose (JWT sessions), bcryptjs, zod

## Notes

- Location and software dropdowns on Create Server are marked "Coming Soon" (UI only)
- Checkout uses mock payment — no real Stripe integration
- Server provisioning is simulated (2–4 second delay, no real infrastructure)
