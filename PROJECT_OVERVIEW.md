# NGO India Hub — Project Overview

> **Version:** 2.0 · **Last updated:** June 2025  
> **Status:** Pre-development · Phase 1 sprint begins after setup checklist is complete  
> **Stack:** Next.js 14 · Supabase · Tailwind CSS · TypeScript · Algolia

---

## Table of Contents

1. [What We Are Building](#1-what-we-are-building)
2. [Problem & Opportunity](#2-problem--opportunity)
3. [Target Audience](#3-target-audience)
4. [NGO Categories](#4-ngo-categories)
5. [System Architecture](#5-system-architecture)
6. [Database Schema](#6-database-schema)
7. [Pages & Features](#7-pages--features)
8. [Full Technology Stack](#8-full-technology-stack)
9. [Project Pipeline — All 5 Phases](#9-project-pipeline--all-5-phases)
10. [Phase 1 Sprint Plan (Week by Week)](#10-phase-1-sprint-plan-week-by-week)
11. [Folder Structure](#11-folder-structure)
12. [Dataset Reference](#12-dataset-reference)
13. [SEO & Growth Strategy](#13-seo--growth-strategy)
14. [Setup Checklist (Before Writing Code)](#14-setup-checklist-before-writing-code)
15. [Key Decisions & Open Questions](#15-key-decisions--open-questions)
16. [Naming Conventions & Code Standards](#16-naming-conventions--code-standards)
17. [Files in This Repository](#17-files-in-this-repository)

---

## 1. What We Are Building

**NGO India Hub** is India's most comprehensive NGO discovery and directory platform. It lets anyone — a college student, a corporate CSR team, a professional wanting to give back, or a donor — find, explore, and connect with NGOs across every cause category and every state in India.

**Core user flow:**

```
Land on homepage
  → Search by name / cause / city  OR  Browse by category / state
    → See filtered list of NGOs with key details
      → Click into a full NGO profile
        → Read about their work, programs, impact
          → Apply to volunteer / donate / partner for CSR
```

**In one line:** Google Maps for Indian NGOs — search, filter, discover, engage.

---

## 2. Problem & Opportunity

Finding credible NGOs in India today is broken:

- Information is scattered across government portals (Darpan, MCA), social media, and word-of-mouth
- No single platform shows structured profiles: programs, impact data, volunteer opportunities, registration status
- Students, professionals, and CSR teams waste hours trying to verify legitimacy and find contact details
- NGOs have no unified channel to reach potential volunteers, donors, and corporate partners

**Market size:** India has 3.3 million registered NGOs. The organised sector that actively recruits volunteers and CSR funding is roughly 50,000–100,000 organisations. No comprehensive discovery platform exists.

---

## 3. Target Audience

Four primary user types (from product research):

| Segment | Need | Key Feature |
|---|---|---|
| **University / college students** | Find volunteer/internship opportunities near campus | Filter by city + internship_available |
| **Graduates** | Find full-time or part-time work at NGOs | Skills matching + opportunities list |
| **Professionals** | Weekend volunteering, skills-based volunteering | Skills_required filter + cause filter |
| **Corporate / CSR teams** | Find verified NGOs for CSR partnerships | is_80g filter + accepts_csr flag + impact score |

Secondary: NGO staff (self-listing), journalists & researchers, government / policy teams, international donors.

---

## 4. NGO Categories

The platform launches with **15 categories**. Each has its own browse page and filter set.

| ID | Category | Sample NGOs |
|---|---|---|
| CAT001 | Education | Pratham, Teach For India, Akshara Foundation |
| CAT002 | Healthcare | MSF India, Aravind Eye Care, Piramal Swasthya |
| CAT003 | Women Empowerment | SEWA, Jagori, Apne Aap Women Worldwide |
| CAT004 | Child Welfare | Save the Children, Childline India, Bachpan Bachao |
| CAT005 | Animal Welfare | PETA India, Blue Cross of India, Wildlife SOS |
| CAT006 | Environment | Greenpeace India, WWF India, CSE |
| CAT007 | Sanitation | Sulabh International, Water For People, Gram Vikas |
| CAT008 | Rural Development | PRADAN, MYRADA, CARE India |
| CAT009 | Disaster Relief | Goonj, SEEDS India, Rapid Response |
| CAT010 | Disability Support | Sightsavers, AADI, NAB India |
| CAT011 | Elderly Care | HelpAge India, Dignity Foundation, ARDSI |
| CAT012 | Hunger Relief | Akshaya Patra, Robin Hood Army, ISKCON Annamrita |
| CAT013 | Human Rights | HRLN, Amnesty India, Jan Sahas |
| CAT014 | Skill Development | NSDC, Labournet, eVidyaloka |
| CAT015 | Mental Health | Vandrevala Foundation, iCall, Sangath |

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ENTRY                               │
│   Homepage Search  ·  Category Browse  ·  State Browse          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                        FRONTEND                                 │
│         Next.js 14 (App Router) + React + Tailwind CSS          │
│    SSR for profiles · SSG for category/state pages · ISR        │
└──────┬─────────────┬──────────────┬──────────────┬─────────────┘
       │             │              │              │
┌──────▼──────┐ ┌────▼─────┐ ┌────▼─────┐ ┌─────▼──────┐
│  Search API │ │  NGO API │ │ Auth API │ │ Admin API  │
│  (Algolia)  │ │ (Supa.)  │ │ (Supa.)  │ │  (custom)  │
└──────┬──────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘
       │             │              │              │
┌──────▼─────────────▼──────────────▼──────────────▼─────────────┐
│                       BACKEND SERVICES                          │
│   Supabase (DB + Auth + Realtime)  ·  Node.js custom routes     │
│   Cloudinary (images)  ·  SendGrid (email)  ·  Redis (cache)    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                        DATA LAYER                               │
│     PostgreSQL (primary)  ·  Algolia index  ·  Redis cache      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      INFRASTRUCTURE                             │
│    Vercel (frontend)  ·  Supabase Cloud  ·  GitHub Actions      │
│    Sentry (errors)  ·  Posthog (analytics)  ·  Cloudinary (CDN) │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture decisions

- **Next.js App Router** — SSG for category/state pages (SEO critical), SSR for dynamic search, ISR for NGO profiles (revalidate every 24h)
- **Supabase** — replaces a separate Node API + DB setup. Gives us Postgres, Auth, Row Level Security, and Realtime out of the box
- **Algolia** — full-text search with instant results, typo tolerance, and faceted filtering. Falls back to Postgres `pg_trgm` if budget is a concern
- **Cloudinary** — handles NGO logo/photo uploads, resizing, and CDN delivery
- **Vercel** — zero-config Next.js deployment with edge CDN and preview URLs per branch

---

## 6. Database Schema

### Core tables

```sql
-- NGOs
CREATE TABLE ngos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id          text UNIQUE NOT NULL,          -- e.g. EDU001
  slug            text UNIQUE NOT NULL,          -- e.g. pratham
  name            text NOT NULL,
  description     text,
  long_description text,
  website         text,
  email           text,
  phone           text,
  logo_url        text,
  social_links    jsonb DEFAULT '{}',
  founded_year    int,
  state_id        uuid REFERENCES states(id),
  city            text,
  address         text,
  pincode         text,
  registration_number text,
  is_80g          text DEFAULT 'Verify',         -- Yes / No / Verify
  is_12a          text DEFAULT 'Verify',
  is_fcra         text DEFAULT 'Verify',
  is_verified     boolean DEFAULT false,
  listing_status  text DEFAULT 'Pending',        -- Active / Pending / Inactive
  volunteer_available   boolean DEFAULT false,
  internship_available  boolean DEFAULT false,
  donation_available    boolean DEFAULT false,
  accepts_csr     boolean DEFAULT false,
  team_size       text,
  funding_type    text,
  beneficiaries_count bigint,
  impact_score    int CHECK (impact_score BETWEEN 1 AND 10),
  last_verified_at date,
  source_url      text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Categories
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id text UNIQUE NOT NULL,   -- e.g. CAT001
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  icon        text,
  description text,
  parent_id   uuid REFERENCES categories(id)
);

-- NGO ↔ Category (many-to-many)
CREATE TABLE ngo_categories (
  ngo_id      uuid REFERENCES ngos(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  is_primary  boolean DEFAULT false,
  PRIMARY KEY (ngo_id, category_id)
);

-- States
CREATE TABLE states (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name    text UNIQUE NOT NULL,
  code    text UNIQUE NOT NULL,   -- e.g. MH, DL, KA
  region  text                    -- North / South / East / West / Northeast / Central
);

-- Programs / Activities
CREATE TABLE programs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id          uuid REFERENCES ngos(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  beneficiaries   int,
  status          text DEFAULT 'active',   -- active / completed / upcoming
  start_date      date,
  end_date        date,
  created_at      timestamptz DEFAULT now()
);

-- Users
CREATE TABLE users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id),
  name        text,
  email       text UNIQUE,
  role        text DEFAULT 'user',   -- user / ngo_admin / admin
  created_at  timestamptz DEFAULT now()
);

-- Volunteer Applications
CREATE TABLE volunteer_applications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id),
  ngo_id      uuid REFERENCES ngos(id),
  program_id  uuid REFERENCES programs(id),
  message     text,
  status      text DEFAULT 'pending',   -- pending / accepted / rejected
  created_at  timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id),
  ngo_id      uuid REFERENCES ngos(id),
  rating      int CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  is_approved boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- NGO Gallery
CREATE TABLE ngo_gallery (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id      uuid REFERENCES ngos(id) ON DELETE CASCADE,
  image_url   text NOT NULL,
  caption     text,
  sort_order  int DEFAULT 0
);
```

### Row Level Security (RLS) policies

```sql
-- Public can read active NGOs
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active ngos"
  ON ngos FOR SELECT USING (listing_status = 'Active');

-- NGO admins can update their own record
CREATE POLICY "ngo admin update own"
  ON ngos FOR UPDATE
  USING (id IN (
    SELECT ngo_id FROM ngo_admins WHERE user_id = auth.uid()
  ));
```

### Algolia search index structure

Each document in the `ngos` index:

```json
{
  "objectID": "uuid",
  "ngo_id": "EDU001",
  "slug": "pratham",
  "name": "Pratham",
  "description": "India's largest education NGO...",
  "primary_category": "Education",
  "categories": ["Education", "Skill Development"],
  "state": "Maharashtra",
  "city": "Mumbai",
  "is_verified": true,
  "volunteer_available": true,
  "internship_available": true,
  "donation_available": true,
  "accepts_csr": false,
  "impact_score": 10,
  "beneficiaries_count": 1200000,
  "skills": ["Teaching", "Communication", "Patience"],
  "_tags": ["education", "maharashtra", "mumbai", "volunteer", "internship"]
}
```

---

## 7. Pages & Features

### Public pages

| Route | Page | Key Features |
|---|---|---|
| `/` | Homepage | Hero search bar, category grid (15 cards), featured NGOs, stats banner, state map CTA |
| `/category/[slug]` | Category listing | Filtered NGO cards, sidebar filters, sort by impact/name/year, active NGO count |
| `/ngo/[slug]` | NGO profile | Full profile (see below), volunteer CTA, share button, related NGOs |
| `/search` | Search results | Live search, advanced filters, URL-serialised filter state |
| `/state/[state]` | State directory | All NGOs in a state, category breakdown, state stats |
| `/compare` | Compare tool *(Phase 4)* | Side-by-side comparison of up to 3 NGOs |

### NGO profile page — section breakdown

```
┌─────────────────────────────────────────────┐
│  HERO: Logo + Name + Category badges        │
│  Verified tick · Founded year · City, State │
│  [ Volunteer ] [ Donate ] [ Share ]         │
├─────────────────────────────────────────────┤
│  ABOUT: Mission · Long description          │
│  Team size · Funding type · Registration    │
│  80G / 12A / FCRA badges                    │
├─────────────────────────────────────────────┤
│  PROGRAMS: Cards for each active program    │
│  Title · Description · Beneficiaries        │
├─────────────────────────────────────────────┤
│  IMPACT: Beneficiaries count · Score        │
│  Years of operation · Key stats             │
├─────────────────────────────────────────────┤
│  GET INVOLVED: Opportunities list           │
│  Skills needed · How to apply form          │
├─────────────────────────────────────────────┤
│  GALLERY: Photo grid (Cloudinary)           │
├─────────────────────────────────────────────┤
│  REVIEWS: Star ratings + text reviews       │
├─────────────────────────────────────────────┤
│  RELATED NGOs: Same category / state        │
└─────────────────────────────────────────────┘
```

### Authenticated pages

| Route | Page | Who |
|---|---|---|
| `/login` & `/register` | Auth pages | All users |
| `/dashboard` | NGO admin dashboard | NGO admins |
| `/dashboard/programs` | Manage programs | NGO admins |
| `/dashboard/applications` | View volunteer applications | NGO admins |
| `/admin` | Super admin panel | Admins only |
| `/admin/ngos` | Verify + edit NGO listings | Admins only |
| `/admin/import` | Bulk CSV import | Admins only |
| `/profile` | User profile + saved NGOs | Logged-in users |

### Filter system

Filters available on category + search pages:

```
State           → dropdown (22 states + "All India")
City            → text input (autocomplete)
Verified        → toggle
Volunteer       → toggle
Internship      → toggle
Donation        → toggle  
CSR             → toggle
Team size       → multi-select (1-10, 10-50, 50-100, 100+)
Funding type    → multi-select
80G registered  → toggle
Founded before  → year slider
Impact score    → range slider (1–10)
Sort by         → Impact score / Name A-Z / Year (oldest/newest) / Beneficiaries
```

---

## 8. Full Technology Stack

### Frontend

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 14.x (App Router) | Framework — SSR, SSG, ISR, routing |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety across the codebase |
| Tailwind CSS | 3.x | Utility-first styling |
| ShadCN UI | latest | Accessible component primitives |
| React Hook Form | 7.x | Form state management |
| Zod | 3.x | Schema validation (forms + API) |
| SWR | 2.x | Client-side data fetching with cache |
| Framer Motion | 11.x | Page transitions + micro-animations |
| Lucide React | latest | Icon set |

### Backend & Data

| Tool | Purpose |
|---|---|
| Supabase | PostgreSQL + Auth + Realtime + Storage + RLS |
| Algolia | Full-text search with instant results and faceted filtering |
| Redis (Upstash) | Cache for search results + rate limiting |
| Cloudinary | NGO logo + gallery image storage and CDN delivery |
| SendGrid / Resend | Transactional email (volunteer applications, NGO notifications) |
| Supabase Edge Functions | Serverless functions (Algolia sync, email triggers) |

### Infrastructure & DevOps

| Tool | Purpose |
|---|---|
| Vercel | Frontend hosting + edge CDN + preview deploys |
| Supabase Cloud | Managed Postgres + Auth hosting |
| GitHub Actions | CI/CD — lint, test, deploy on push to main |
| Sentry | Error tracking + performance monitoring |
| Posthog | Product analytics — page views, funnel tracking |
| Vercel Analytics | Core Web Vitals monitoring |

### Developer Tooling

| Tool | Purpose |
|---|---|
| ESLint + Prettier | Code linting and formatting |
| Husky + lint-staged | Pre-commit hooks |
| Jest + React Testing Library | Unit + integration tests |
| Playwright | End-to-end browser tests |
| Storybook | Component documentation |

### Environment variables needed

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=
ALGOLIA_ADMIN_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email
SENDGRID_API_KEY=          # or RESEND_API_KEY

# Redis (optional for Phase 1)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_SITE_URL=https://ngoindiaHub.in
NEXT_PUBLIC_SITE_NAME=NGO India Hub
```

---

## 9. Project Pipeline — All 5 Phases

### Overview

```
Phase 1 (Weeks 1–5)    → MVP live: search, browse, 234 NGO profiles
Phase 2 (Weeks 6–8)    → NGO self-listing + admin verification
Phase 3 (Weeks 9–11)   → User accounts + volunteer applications + reviews
Phase 4 (Weeks 12–13)  → Maps, compare tool, SEO pages, impact stats
Phase 5 (Ongoing)      → Monetisation: premium listings, CSR matchmaking, donor portal
```

---

### Phase 1 — Foundation & MVP

**Goal:** A publicly accessible website where anyone can search and browse 234 verified NGO profiles.

**Deliverables:**

- [ ] Homepage with search bar + category grid + featured NGOs
- [ ] Category listing pages (15 pages, SSG)
- [ ] NGO profile pages (234 pages, ISR)
- [ ] Search results page with Algolia
- [ ] State browse pages (22 pages, SSG)
- [ ] Filter sidebar (state, city, volunteer, internship, donation, 80G, verified)
- [ ] Admin panel — basic NGO add/edit/verify
- [ ] Supabase database seeded with all 234 NGOs
- [ ] Algolia index populated
- [ ] Deployed to Vercel with custom domain
- [ ] Analytics + Sentry set up
- [ ] Mobile responsive across all pages

**Success criteria:** Any user can land on the site, find an NGO by name or category, and get to a full profile page in under 3 clicks.

---

### Phase 2 — NGO Onboarding

**Goal:** NGOs can list themselves without needing the admin to manually enter data.

**Deliverables:**

- [ ] NGO self-signup flow (email + password via Supabase Auth)
- [ ] NGO admin dashboard — edit profile, programs, gallery
- [ ] Admin verification queue — review submissions, approve/reject
- [ ] Email notifications — confirmation to NGO on submission, alert to admin
- [ ] Bulk CSV import tool for admin (for adding 50+ NGOs at once)
- [ ] Image upload — logo + gallery via Cloudinary
- [ ] "Claim your NGO" flow for existing listings

**Success criteria:** An NGO can discover their own listing and take ownership of it within 15 minutes.

---

### Phase 3 — User Engagement

**Goal:** Logged-in users can apply to volunteer, save NGOs, and leave reviews.

**Deliverables:**

- [ ] User registration + login (email / Google OAuth)
- [ ] User profile page — saved NGOs, application history
- [ ] Volunteer application form on NGO profile page
- [ ] Application tracking for users and NGO admins
- [ ] Email flow — application confirmation + NGO notification
- [ ] Review system — star rating + text comment
- [ ] Review moderation by admin
- [ ] "Save NGO" / bookmarks feature
- [ ] Notification system (in-app + email)

**Success criteria:** A user can apply to volunteer at an NGO in under 5 minutes from landing on the homepage.

---

### Phase 4 — Discovery Plus

**Goal:** Deeper discovery features and SEO scale-up.

**Deliverables:**

- [ ] India state map — interactive choropleth showing NGO density
- [ ] NGO comparison tool — side-by-side up to 3 NGOs
- [ ] Impact stats page — platform-wide numbers (total NGOs, beneficiaries, etc.)
- [ ] "Top NGOs in [City]" programmatic SEO pages
- [ ] Structured data (JSON-LD) — NGO schema, breadcrumbs, reviews, FAQ
- [ ] Sitemap auto-generation on every build
- [ ] Related NGOs on profile pages (by category + state)
- [ ] Skills-based matching — suggest NGOs based on user's skill profile
- [ ] Performance audit — target LCP < 2s, CLS < 0.1

**Success criteria:** At least 20 category/state pages ranking on page 1 of Google for "[category] NGOs in [city]" queries within 3 months of launch.

---

### Phase 5 — Monetisation (Ongoing)

**Goal:** Sustainable revenue without compromising user trust.

**Revenue streams:**

| Stream | What | Price model |
|---|---|---|
| Premium NGO listings | Verified badge + priority ranking + rich media | ₹2,000–₹5,000/month |
| CSR matchmaking | Curated NGO shortlists for corporate CSR teams | ₹10,000–₹50,000/project |
| Donor portal | Secure donation gateway with 80G receipts | 2–3% transaction fee |
| Sponsored categories | Category page sponsorship by aligned corporates | ₹20,000–₹50,000/month |
| Data & insights | Anonymised sector reports for researchers/policy | ₹5,000–₹20,000/report |

**Deliverables:**

- [ ] Premium listing upgrade flow (Stripe / Razorpay)
- [ ] CSR partner portal — curated NGO shortlists with due diligence reports
- [ ] Donation gateway (Razorpay integration + automated 80G receipts)
- [ ] Sponsored category pages
- [ ] Analytics dashboard for NGO admins (profile views, application rate, etc.)

---

## 10. Phase 1 Sprint Plan (Week by Week)

### Week 1 — Project Setup

**Day 1–2: Repository & tooling**
- [ ] Create GitHub repo with Next.js 14 App Router template
- [ ] Set up TypeScript, Tailwind CSS, ESLint, Prettier, Husky
- [ ] Configure `.env.local` with all API keys
- [ ] Set up Vercel project linked to GitHub (auto-deploy on main)
- [ ] Set up Sentry project + install SDK

**Day 3–4: Database**
- [ ] Create Supabase project
- [ ] Write and run all migration SQL files (see schema above)
- [ ] Enable RLS on all tables
- [ ] Write `seed.sql` from `NGO_India_Dataset_v2.xlsx` (234 NGOs)
- [ ] Verify all 234 rows imported correctly

**Day 5: Search index**
- [ ] Create Algolia application and `ngos` index
- [ ] Write the Supabase → Algolia sync script
- [ ] Run initial index population
- [ ] Test search returning correct results

---

### Week 2 — Homepage & Category Pages

**Day 1–2: Design system**
- [ ] Define Tailwind config — colours, fonts, spacing, breakpoints
- [ ] Build base components: Button, Badge, Card, Input, Spinner
- [ ] Build Layout component: Header + Footer + mobile nav
- [ ] Build NGO card component (used on listing pages)

**Day 3–5: Pages**
- [ ] Homepage (`/`) — hero search, category grid, featured NGOs, stats
- [ ] Category listing page (`/category/[slug]`) — NGO cards + filter sidebar
- [ ] Filter sidebar component — state, city, toggles, sort
- [ ] Verify all 15 category pages generate correctly (SSG)

---

### Week 3 — NGO Profile & Search

**Day 1–3: NGO profile page**
- [ ] Build `/ngo/[slug]` page with all sections (hero, about, programs, impact, get involved, gallery, reviews placeholder)
- [ ] Verify ISR revalidation working (every 24h)
- [ ] Build related NGOs component
- [ ] Share button (native Web Share API + clipboard fallback)

**Day 4–5: Search**
- [ ] Build `/search` page with Algolia InstantSearch
- [ ] URL-serialised filter state (so search results are shareable)
- [ ] Autocomplete in homepage hero search bar
- [ ] Test search with typos, partial matches, category filters

---

### Week 4 — State Pages, Admin & Polish

**Day 1–2: State pages**
- [ ] Build `/state/[state]` pages (SSG, 22 pages)
- [ ] State landing with NGO count, category breakdown, NGO cards

**Day 3–4: Admin panel**
- [ ] `/admin` page behind Supabase Auth (admin role only)
- [ ] NGO list with edit/verify/deactivate actions
- [ ] Basic NGO edit form

**Day 5: Mobile + accessibility**
- [ ] Full mobile responsiveness pass on all pages
- [ ] Keyboard navigation audit
- [ ] Focus states on all interactive elements
- [ ] Alt text on all images

---

### Week 5 — Launch Prep

- [ ] Full QA pass — test every page, filter, search, link
- [ ] Cross-browser test — Chrome, Firefox, Safari, Edge
- [ ] Performance audit — Lighthouse score target: 90+ all categories
- [ ] Core Web Vitals — LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] SEO — meta tags on all pages, OpenGraph images, robots.txt, sitemap
- [ ] Analytics — Posthog + Vercel Analytics connected and logging events
- [ ] Custom domain configured + SSL verified
- [ ] Final seed data check — all 234 NGO profiles rendering correctly
- [ ] **LAUNCH** 🚀

---

## 11. Folder Structure

```
ngo-india-hub/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (public)/                 # Public route group
│   │   │   ├── page.tsx              # Homepage /
│   │   │   ├── category/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # /category/education
│   │   │   ├── ngo/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # /ngo/pratham
│   │   │   ├── search/
│   │   │   │   └── page.tsx          # /search
│   │   │   └── state/
│   │   │       └── [state]/
│   │   │           └── page.tsx      # /state/maharashtra
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/                # NGO admin dashboard
│   │   │   ├── page.tsx
│   │   │   ├── programs/page.tsx
│   │   │   └── applications/page.tsx
│   │   ├── admin/                    # Super admin
│   │   │   ├── page.tsx
│   │   │   ├── ngos/page.tsx
│   │   │   └── import/page.tsx
│   │   ├── api/                      # Next.js API routes
│   │   │   ├── ngos/route.ts
│   │   │   ├── search/route.ts
│   │   │   └── applications/route.ts
│   │   ├── layout.tsx                # Root layout
│   │   ├── error.tsx                 # Error boundary
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # Base components (Button, Card, Badge, Input...)
│   │   ├── ngo/                      # NGO-specific components
│   │   │   ├── NgoCard.tsx           # Listing card
│   │   │   ├── NgoProfile.tsx        # Full profile layout
│   │   │   ├── NgoHero.tsx
│   │   │   ├── NgoPrograms.tsx
│   │   │   ├── NgoGallery.tsx
│   │   │   └── NgoReviews.tsx
│   │   ├── search/                   # Search components
│   │   │   ├── SearchBar.tsx         # Hero search
│   │   │   ├── FilterSidebar.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   └── CategoryGrid.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── MobileNav.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server-side client
│   │   │   └── queries.ts            # Reusable DB queries
│   │   ├── algolia/
│   │   │   ├── client.ts
│   │   │   └── sync.ts               # Supabase → Algolia sync
│   │   └── utils.ts                  # Shared helpers
│   │
│   ├── types/
│   │   ├── ngo.ts                    # NGO, Program, Review types
│   │   ├── category.ts
│   │   ├── user.ts
│   │   └── database.ts               # Generated Supabase types
│   │
│   └── styles/
│       └── globals.css
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_indexes.sql
│   └── seed.sql                      # 234 NGO seed data
│
├── public/
│   ├── images/
│   └── icons/
│
├── docs/                             # ← THIS FOLDER
│   ├── PROJECT_OVERVIEW.md           # This file
│   ├── NGO_India_Hub_Project_Overview.docx
│   ├── ngo_india_hub_architecture.png
│   └── NGO_India_Dataset_v2.xlsx
│
├── scripts/
│   └── seed-algolia.ts               # One-time index population
│
├── .env.local                        # Local environment variables
├── .env.example                      # Committed env template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 12. Dataset Reference

**File:** `docs/NGO_India_Dataset_v2.xlsx`

| Property | Value |
|---|---|
| Total NGOs | 234 |
| Categories | 15 (15 NGOs each, roughly balanced) |
| States covered | 22 out of 36 |
| Columns | 37 |
| Dataset version | 2.0 (June 2025) |

### Key columns for the application

| Column | DB field | Used for |
|---|---|---|
| `ngo_id` | `ngo_id` | Primary identifier, ID prefix shows category |
| `slug` | `slug` | URL path — `/ngo/{slug}` |
| `is_80g` / `is_12a` / `is_fcra` | same | Trust badges on profile pages |
| `impact_score` | `impact_score` | Default sort order on listing pages |
| `volunteer_available` | same | Primary filter for student audience |
| `activities` | → `programs` table | Cards on profile page |
| `opportunities` | `opportunities` | "How to get involved" section |
| `skills_required` | `skills_required` | Phase 3 skills matching |
| `long_description` | `long_description` | NGO profile About section |
| `social_links` | `social_links` (jsonb) | Social icons on profile |
| `accepts_csr` | same | CSR partner filter for corporates |

### Data quality notes

- **140 rows** have `is_80g = "Verify"` — these need manual cross-checking against [Darpan](https://darpan.gov.in), [NGOBox](https://ngobox.org), or direct NGO websites before going live
- **`registration_number`** is set to `"Verify"` for all rows — populate from Darpan or MCA portal
- **`logo_url`** is set to `favicon.ico` fallback — replace with actual logo URLs or Cloudinary uploads when NGOs onboard
- **16 Indian states** still have zero coverage — priority expansion in Phase 2 self-listing
- The 3 HelpAge India duplicates from v1 have been consolidated into one record (ELD001)

### Importing the dataset

```bash
# 1. Export to CSV from Excel
# 2. Use the Supabase import script
npx ts-node scripts/import-ngos.ts --file docs/NGO_India_Dataset_v2.xlsx

# 3. Verify row count
# Should print: "Imported 234 NGOs successfully"

# 4. Run Algolia sync
npx ts-node scripts/seed-algolia.ts
# Should print: "Indexed 234 documents"
```

---

## 13. SEO & Growth Strategy

### Technical SEO

- **SSG for category + state pages** — baked at build time, served from CDN, extremely fast
- **ISR for NGO profiles** — rebuilt every 24 hours, balances freshness with performance
- **Structured data (JSON-LD)** on every NGO profile:
  - `Organization` schema with address, contact, founding date
  - `BreadcrumbList` schema
  - `AggregateRating` schema once reviews go live
- **OpenGraph + Twitter Card** meta on every page — enables rich link previews when shared
- **Sitemap** auto-generated at build — submitted to Google Search Console
- **`robots.txt`** — allow all public pages, disallow admin and dashboard
- **Core Web Vitals targets:** LCP < 2.5s · FID < 100ms · CLS < 0.1

### Target keyword clusters

| Cluster | Example queries | Pages to target |
|---|---|---|
| Category in India | "education NGOs in India", "animal welfare NGOs India" | `/category/[slug]` |
| Category in city | "NGOs in Mumbai", "education NGOs in Delhi" | `/state/[state]` + `/search` |
| Specific NGO | "Pratham NGO volunteer", "HelpAge India internship" | `/ngo/[slug]` |
| Intent-based | "how to volunteer at NGO India", "NGO internship for college students" | Blog (Phase 2) |
| CSR-focused | "CSR NGO partners India", "80G registered NGOs India" | `/search` with CSR filter |

### Growth channels

- **College campus outreach** — the U.G. / graduate audience is the fastest early adopter. Partner with NSS units, placement cells, and student clubs at IITs, NITs, and colleges
- **LinkedIn** — for professional and CSR audience. Content: "Top 10 NGOs for [skill] volunteers", "How to find CSR partners in India"
- **NGO partnerships** — get featured NGOs to promote their profile page to their own networks
- **WhatsApp sharing** — add a "Share on WhatsApp" button on every NGO profile (huge traffic driver in India)
- **Google Ads** — small budget on high-intent queries like "volunteer NGO [city]" for Phase 3+

---

## 14. Setup Checklist (Before Writing Code)

Complete every item before development begins:

### Accounts & services
- [ ] Create GitHub organisation / repo: `ngo-india-hub`
- [ ] Create Supabase project at [supabase.com](https://supabase.com) — note URL + anon key + service role key
- [ ] Create Algolia application — note App ID + Search API key + Admin API key
- [ ] Create Cloudinary account — create upload preset `ngo-hub-uploads`
- [ ] Create SendGrid (or Resend) account — verify sending domain
- [ ] Create Sentry project (Next.js) — note DSN
- [ ] Create Posthog project — note API key
- [ ] Create Vercel project — link to GitHub repo

### Domain & DNS
- [ ] Purchase domain (suggested: `ngoindiaHub.in` or `ngoindia.in` or `findngo.in`)
- [ ] Configure DNS on Vercel
- [ ] Verify SSL certificate

### Design
- [ ] Finalise colour palette in `tailwind.config.ts` (suggested: purple primary, teal accent)
- [ ] Choose and configure fonts (suggested: Inter or Geist)
- [ ] Wireframe the 3 core pages on Figma or Excalidraw: Homepage, Category page, NGO Profile
- [ ] Agree on card design for NGO listing cards

### Data
- [ ] Prepare the seed SQL from `NGO_India_Dataset_v2.xlsx`
- [ ] Cross-verify 20–30 NGO registrations on Darpan before launch
- [ ] Collect 3–5 real photos per category for homepage hero section
- [ ] Write category descriptions (1 paragraph each) for the 15 category pages

### Development environment
- [ ] Node.js 20+ installed
- [ ] Run `npx create-next-app@latest` with TypeScript + Tailwind + App Router + `src/` directory
- [ ] Install all dependencies (see package.json below)
- [ ] Copy `.env.example` to `.env.local` and fill in all values
- [ ] Confirm `npm run dev` starts without errors

### Suggested `package.json` dependencies

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "latest",
    "algoliasearch": "^4",
    "react-instantsearch": "^7",
    "react-hook-form": "^7",
    "zod": "^3",
    "swr": "^2",
    "framer-motion": "^11",
    "lucide-react": "latest",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "next-cloudinary": "^5",
    "@sentry/nextjs": "^8",
    "posthog-js": "^1"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "tailwindcss": "^3",
    "postcss": "^8",
    "autoprefixer": "^10",
    "eslint": "^8",
    "eslint-config-next": "14.x",
    "prettier": "^3",
    "prettier-plugin-tailwindcss": "^0.6",
    "husky": "^9",
    "lint-staged": "^15",
    "@testing-library/react": "^14",
    "@testing-library/jest-dom": "^6",
    "jest": "^29",
    "@playwright/test": "^1"
  }
}
```

---

## 15. Key Decisions & Open Questions

### Decided

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 App Router | Best SSG/SSR flexibility for SEO + performance |
| Database | Supabase (Postgres) | Full-stack BaaS, avoids managing separate API + DB |
| Search | Algolia | Instant search, typo tolerance, faceted filters — best UX |
| Styling | Tailwind CSS | Fast iteration, consistent design system |
| Hosting | Vercel | Zero-config Next.js, edge CDN, preview URLs |
| Images | Cloudinary | Automatic resizing, CDN, generous free tier |
| Auth | Supabase Auth | Already in stack, supports Google OAuth |

### Open questions (decide before Week 2)

1. **Algolia vs Supabase pg_trgm** — Algolia has a generous free tier (10K records, 10K searches/month). If we expect higher volume early, pg_trgm is free but less powerful. Decide after Algolia free tier limits are confirmed.

2. **Paid tier for Supabase** — Free tier has 500MB DB storage. With 234 NGOs + programs + galleries, we'll stay within it for Phase 1. Plan to upgrade to Pro ($25/month) before Phase 3 when user data comes in.

3. **Blog / content section** — A blog ("How to volunteer", "Top NGOs for MBA students") would accelerate SEO. Scope it for Phase 2 or later to avoid scope creep in Phase 1.

4. **Mobile app** — React Native or PWA? Phase 5 consideration. Build the web platform first and validate traffic before investing in native.

5. **Languages** — English only for Phase 1. Hindi and regional language support in Phase 4+. Design the DB and content schema to support i18n from the start (even if we don't use it yet).

6. **Monetisation timing** — Introduce premium listings only after hitting 50K monthly visitors. Don't monetise too early and damage trust.

---

## 16. Naming Conventions & Code Standards

### File naming
- Pages: `page.tsx` (Next.js convention)
- Components: `PascalCase.tsx` — e.g. `NgoCard.tsx`, `FilterSidebar.tsx`
- Utilities: `camelCase.ts` — e.g. `formatBeneficiaries.ts`
- Types: `camelCase.ts` — e.g. `ngo.ts`, `category.ts`
- SQL migrations: `001_description.sql` — numbered sequentially

### TypeScript conventions
```typescript
// NGO type — matches DB schema exactly
export type NGO = {
  id: string
  ngo_id: string
  slug: string
  name: string
  description: string | null
  long_description: string | null
  primary_category: string
  state: string
  city: string
  is_80g: 'Yes' | 'No' | 'Verify'
  is_12a: 'Yes' | 'No' | 'Verify'
  is_fcra: 'Yes' | 'No' | 'Verify'
  is_verified: boolean
  listing_status: 'Active' | 'Pending' | 'Inactive'
  volunteer_available: boolean
  internship_available: boolean
  donation_available: boolean
  accepts_csr: boolean
  impact_score: number
  beneficiaries_count: number | null
  social_links: Record<string, string>
  created_at: string
  updated_at: string
}
```

### Component conventions
```typescript
// Always define props type above component
type NgoCardProps = {
  ngo: NGO
  showCategory?: boolean
  className?: string
}

// Named export + JSDoc for shared components
/**
 * NGO listing card — used on category pages, search results, and homepage featured section.
 */
export function NgoCard({ ngo, showCategory = true, className }: NgoCardProps) {
  // ...
}
```

### Git conventions
- Branch naming: `feature/homepage-search`, `fix/ngo-card-mobile`, `chore/update-deps`
- Commit messages: conventional commits — `feat:`, `fix:`, `chore:`, `docs:`, `style:`
- PRs: require passing CI (lint + type check + tests) before merge to `main`

---

## 17. Files in This Repository

All project documentation lives in the `/docs` folder:

| File | Description |
|---|---|
| `PROJECT_OVERVIEW.md` | This file — full project spec, pipeline, and reference |
| `NGO_India_Hub_Project_Overview.docx` | Formatted Word version of project overview |
| `ngo_india_hub_architecture.png` | System architecture diagram (PNG) |
| `NGO_India_Dataset_v2.xlsx` | Master NGO dataset — 234 NGOs, 37 columns, 6 sheets |

### How to use these files with Claude

When starting a new coding session, share this file by saying:

> *"Here is my project overview: [paste PROJECT_OVERVIEW.md or upload it]. We are working on [specific task]. The tech stack is Next.js 14, Supabase, Tailwind CSS, TypeScript, and Algolia."*

This gives Claude full context on the schema, folder structure, stack decisions, and conventions without needing to re-explain the project each time.

---

*This document is a living spec. Update the relevant sections at the start of each new phase.*

*NGO India Hub — Building India's most comprehensive NGO discovery platform.*
