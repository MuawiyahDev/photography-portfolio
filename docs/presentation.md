---
marp: true
theme: default
paginate: true
header: "Photography Portfolio — Bilal Ahmed"
footer: "Next.js · Prisma · PostgreSQL · Auth.js"
---

# Photography Portfolio
## A website for photographer Bilal Ahmed — now with a real backend

Assignment 3: database, API, authentication, and going live.

---

## What this project is

Bilal Ahmed is a photographer. He needs a website that shows his work —
portraits, street, buildings, nature, fine art — and lets clients contact
him and book shoots.

It started as plain HTML/CSS/JS, then became a React + Vite site.
This week it grew a real backend: a database, a working API, real login,
and a private dashboard to manage everything.

**In short:** a public gallery + a CMS dashboard, one Next.js app,
one PostgreSQL database.

---

## What it is built with

- **Next.js 15 (React 19)** — pages *and* API routes in one app
- **Tailwind CSS** — styling with ready-made classes
- **Prisma** — defines the database schema, runs migrations, seeds data
- **PostgreSQL on Neon** — the free hosted database
- **Auth.js (NextAuth v5)** — signup, login, signed session cookies
- **Zod** — checks every API input before it touches the database
- **No TypeScript** — plain JavaScript throughout, as required

---

## Why Next.js (instead of Express)

The assignment allows Express *or* Next.js. I chose Next.js because:

- Frontend and API live in **one app** — no split client/server folders,
  one deploy instead of two
- API routes are just files: `app/api/works/route.js` → `GET /api/works`
- Pages can read the database directly on the server (fast, SEO-friendly),
  and client interactions (likes, forms, dashboard) go through the API

---

## How the code is organized

```
app/
├── (site)/           → public pages: home, login, register
├── admin/            → dashboard: works, categories, hero,
│                       about, contact, users
└── api/              → JSON routes (works, favorites,
                        inquiries, categories, auth, admin/*)

src/
├── components/       → UI pieces (gallery, header, ui kit…)
├── lib/              → prisma, auth guard, validation,
│                       data access helpers
└── data/             → seed source for the database

prisma/
├── schema.prisma     → the database schema
├── seed.js           → fills the database with the old hardcoded data
└── migrations/       → version history of the schema
```

---

## The database (6 tables, plain English)

- **User** — an account: name, email, password *hash*, role
  (`ADMIN` can manage the site, `USER` cannot)
- **Work** — one photo in the gallery: title, category, image URL,
  size, alt text
- **Category** — a filter tab (Portraits, Street…): label, slug, order
- **Favorite** — "user X saved work Y" — one row per heart
- **Inquiry** — a message sent through the contact form
- **SiteSetting** — editable page content (hero, about, contact text)

Every table was created with `prisma migrate` — the schema lives in
`prisma/schema.prisma` and migrations record each change.

---

## From hardcoded files to real data

Week 2 data moved into the database with one command:

```
npm run db:seed
```

The seed script reads the old photo list in `src/data/works.js` and
**inserts it into Neon** (it's idempotent — running it twice never
duplicates anything). Categories and the admin account are seeded too.

After seeding, the site never reads the hardcoded list again — every
photo, tab, and text on the page comes from PostgreSQL.

---

## The API

**Public JSON routes** (anyone):
- `GET /api/works` — all photos as JSON
- `GET /api/categories` — the gallery tabs
- `POST /api/inquiries` — contact form submissions
- `POST /api/favorites` — save/remove a heart (sign-in required)

**Dashboard routes** (`/api/admin/*`):
- create/update/delete works, categories, page settings, users

Security on every admin route: **401** if not signed in,
**403** if signed in but not an admin. Every input is checked with Zod
before the database is touched.

---

## Real authentication

- **Signup** → `POST /api/auth/register` hashes the password with
  bcrypt and stores the user — the plain password is never saved
- **Login** → Auth.js verifies the hash, then signs a **session cookie**
- The session is a signed JWT, so it **survives page refresh** and
  works across serverless functions
- The header reacts to the session: **Sign in / Sign up** when logged
  out, **name + Dashboard + Sign out** when logged in
- Visiting `/login` while signed in redirects you away automatically

---

## The admin dashboard (the CMS)

A private area at `/admin`, only reachable by the `ADMIN` role:

- **Portfolio** — add, edit, delete photos (with live image preview)
- **Categories** — create/rename/reorder the gallery filter tabs;
  can't delete a tab that photos still use
- **Hero / About / Contact** — edit the public page text, images, and
  buttons — changes appear on the site immediately
- **Users** — list accounts, promote/demote admins, remove users
- **Inquiries** — read the messages sent through the contact form

Everything a non-coder would need — no more editing source files.

---

## The public site (what visitors see)

- **Gallery tabs come from the database** — add a category in the
  dashboard and it appears as a tab instantly
- **Hearts and stars both live in the database** — favorites *and*
  ratings are tied to your account, so they survive a new device;
  rating or saving asks you to sign in first, exactly like the wishlist
- **Contact form** — validated, saved to the database as an Inquiry,
  and shown in the dashboard; a copy can be downloaded as `.txt`
- Dark/light mode follows the device; layout works from phone to
  4-column desktop

---

## Secrets and git

- **`.env`** holds `DATABASE_URL`, `AUTH_SECRET`, and admin credentials
- `.gitignore` blocks it — `git check-ignore .env` confirms it's
  **never committed**
- `.env.example` is committed as a template with empty values
- Nothing secret ever reaches the browser: `AUTH_SECRET` and the
  database URL are used only on the server

---

## What's next

1. **Deploy to Vercel** — connect the repo, add the `.env` variables,
   and the whole app (site + API) goes live on one public URL
2. Push the finished code to GitHub and share the link with the
   instructor
3. Optional: email forwarding for inquiries, local image hosting,
   automated tests

Thank you — questions?
