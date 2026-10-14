---
marp: true
theme: default
paginate: true
header: "Photography Portfolio — Bilal Ahmed"
footer: "React · Vite · Tailwind CSS"
---

# Photography Portfolio
## A website for photographer Bilal Ahmed

Rebuilt from plain static files into a modern React app.

---

## What this project is

Bilal Ahmed is a photographer. He needed a website to show his work — portraits, street shots, buildings, nature, and fine art — and a way for clients to contact him and book a shoot.

The old site was plain HTML, CSS, and JavaScript files. I rebuilt it with React, Vite, and Tailwind CSS so the code is cleaner, easier to change, and nicer to use.

**In short:** 10 photos · 8 browsing tabs · contact form · no server needed.

---

## What it is built with

- **React** — builds the page out of small reusable pieces
- **Vite** — the tool that runs and packages the site
- **Tailwind CSS** — styling with ready-made classes
- **Browser storage** — remembers likes, ratings, and form drafts
- **No backend** — the finished site is just static files

---

## How the code is organized

```
src/
├── App.jsx            → puts all sections together
├── data/              → all texts and photos in one place
├── hooks/             → remembers likes, stars, drafts
└── components/        → header, hero, gallery, about,
                         contact form, footer + small
                         reusable pieces (buttons, stars…)
```

Each part of the page is its own piece. Change one piece, nothing else breaks.

---

## One list drives the whole gallery

Instead of copying the same photo code ten times, every photo lives in a single list:

```js
{ id: "theo-daylight", title: "Theo, in daylight",
  category: "portraits",
  src: "https://images.unsplash.com/photo-…" }
```

The page simply loops over the list and draws a card per photo. To add a new photo, you add one entry — that's it.

---

## Browsing the gallery

- **Filter tabs** — All, Portraits, Editorial, Architecture, Street, Nature, Fine Art, plus Favorites
- **Hearts** — tap to save a photo; the count badge on the Favorites tab updates live
- **Stars** — rate any photo from 1 to 5, with a preview as you hover
- **Empty state** — if you have no favorites yet, the page explains what to do instead of showing a blank box

---

## It remembers things after refresh

- **Favorites** — saved hearts stay even if you close and reopen the page
- **Star ratings** — your ratings stay too
- **Contact draft** — half-written messages are auto-saved, so nothing is lost on refresh
- **Download a copy** — visitors can save their inquiry as a `.txt` file (only enabled once the form is filled in correctly)

One honest note: a website alone can't send messages to the owner's inbox — that part needs an email service. Everything else works with no server at all.

---

## Looks good on every screen

- The gallery is a masonry layout: each photo keeps its natural shape, so nothing gets cropped — square, tall, or wide
- Layout grows step by step: 1 column on phones, up to 4 on big screens
- Photo captions are always readable on touch screens; zoom-on-hover is just a bonus on desktop
- Dark and light appearance follow the device setting automatically — no switch needed
- Nothing scrolls sideways on any screen size

---

## What's next

1. Connect the form to an email service so inquiries reach the inbox
2. Host the photos locally in modern formats so they load faster
3. Add automated tests for the filters and the form
4. Put the site online (it builds to plain static files, so hosting is free)

Thank you — questions?
