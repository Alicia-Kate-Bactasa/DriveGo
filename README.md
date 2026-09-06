# DriveGo — Centralized Donation Drive Platform

## Overview

DriveGo is a centralized platform where organizations publish donation drives and users discover, support, and track campaigns. Browse drives by category, follow organizations, save drives for later, and monitor progress with transparency.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Database | Prisma ORM |
| Validation | Zod |
| Deployment | Vercel |

## Features

- **Category browsing** — 10 donation categories with filtering and search
- **Location-based discovery** — Nearby drives via geolocation
- **Progress bars** — Visual campaign progress tracking
- **Organization profiles** — Verified org pages with active drive listings
- **Saved drives** — Bookmark drives for later
- **Follow system** — Follow organizations and campaigns
- **Campaign updates** — Organizer updates on progress
- **Admin moderation** — Draft review and drive status management
- **Authentication** — Supabase Auth with server-side session management
- **Security** — RLS policies, Zod validation, security headers, rate limiting

## Getting Started

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Deployment

Push to GitHub and deploy on Vercel. Set environment variables from `.env.example` in the Vercel dashboard.
