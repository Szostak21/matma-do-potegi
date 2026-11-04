# Matma do potęgi

Booking and billing system for a maths tutoring studio in Krakow. It is the software behind [matmadopotegi.pl](https://www.matmadopotegi.pl): the public site, the deposit checkout, and the admin panel the studio uses every week.

[![CI](https://github.com/Szostak21/matma-do-potegi/actions/workflows/ci.yml/badge.svg)](https://github.com/Szostak21/matma-do-potegi/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2d3748)
![Stripe](https://img.shields.io/badge/Stripe-Checkout-635bff)

## Context

A solo project: I built it and keep it running in production. The studio opened in July 2026, and since then the system has recorded **36 sign-ups** and **24 paid deposits**. Parents fill in a form, pay a deposit to hold a place, and the studio collects monthly tuition from the admin panel. The interface and the legal pages are in Polish, because the customers are.

![Landing page](docs/screenshots/landing.png)

![Admin billing panel](docs/screenshots/admin-payments.png)

## Features

- Lead form with a deposit checkout, group capacity, and a waiting state when a level is full
- Monthly tuition: per-student amounts, standing discounts, and one-off adjustments
- Payment links the studio pastes into SMS (`/p/<code>`). The card session is created when the parent opens the link
- Referral discount on the first month
- Transactional email (payment link, deposit confirmation, owner notification)
- Scheduled jobs for reminders (stubs, authorized with a separate cron secret)
- GA4, Meta Pixel and the Conversions API, loaded only after cookie consent, deduplicated by `event_id`

## Architecture

```mermaid
flowchart LR
  browser[Browser]
  next[Next.js]
  db[(PostgreSQL)]
  stripe[Stripe]
  resend[Resend]
  cron[Vercel Cron]

  browser --> next
  next --> db
  next -->|"Checkout session"| stripe
  stripe -->|"signed webhook"| next
  next --> resend
  cron -->|"Bearer CRON_SECRET"| next
```

Server Actions handle the admin panel. Route handlers handle the Stripe webhook, the public payment page and cron. Prisma talks to PostgreSQL in the `matma` schema. Details, including lead statuses and the billing rules, are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Engineering highlights

**Stable payment links.** Customers receive `/p/<shortCode>`, not a Stripe URL. `CheckoutProvider` creates the gateway session only when the link is opened, so a later move from Stripe to Tpay does not invalidate messages that were already sent.

**A payment is completed exactly once.** The Stripe webhook and the customer's return from checkout usually arrive within the same second, and both try to close the payment. The switch to `PAID` is a conditional `UPDATE ... WHERE status <> 'PAID'`: one caller gets the row, the other gets zero rows and skips the emails and the referral reward. Tuition is added to the billing period with an atomic increment, so concurrent payments cannot overwrite each other.

**The last seat goes to one family.** A sign-up takes a per-package `pg_advisory_xact_lock` before counting free places, so parallel requests for a nearly full group are checked one after another instead of all seeing the same free seat.

Both cases have an integration test that fires 8 parallel calls at a real PostgreSQL. CI runs it against a Postgres service container.

**Analytics follows the consent banner.** GA4, Meta Pixel, Clarity and the server-side Conversions API run only after marketing consent. Browser and server events share an `event_id`, so Meta counts one conversion.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Prisma, PostgreSQL, Stripe Checkout, Resend, Zod, Vitest. Hosted on Vercel.

## Layout

```
app/            pages, webhook, cron routes
actions/        admin server actions
components/     marketing site and admin UI
lib/            billing, payments, auth, analytics
emails/         React Email templates
prisma/         schema and migrations
scripts/        Prisma CLI wrapper, demo seed
```

## Run locally

```bash
docker compose up -d
cp .env.example .env
npm install
npm run db:deploy
npm run db:seed:local
npm run dev
```

`db:seed:local` loads demo families and groups. Sign in at [http://localhost:3000/admin](http://localhost:3000/admin) with `ADMIN_SECRET`.

## Tests

```bash
npm test
npm run typecheck
npm run lint
```

GitHub Actions runs the same checks on every push and pull request. The unit tests cover money parsing, tuition suggestions, referral and UTM capture, SMS templates, and the admin session cookie.

The concurrency tests need a local database (`docker compose up -d`, then `npm run db:deploy`):

```bash
INTEGRATION_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=matma" npm run test:integration
```

## Roadmap

The payment provider is behind `CheckoutProvider` so Tpay can replace Stripe without new customer links. SMS is copied from the panel today; an SMS API sender plugs into the same rendered template.

## License

Source is public so it can be reviewed as a portfolio project. All rights reserved. You can read it. You cannot copy it into another product or run a competing service from it.
