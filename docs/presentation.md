---
marp: true
theme: default
paginate: true
header: "Photography Portfolio — Bilal Ahmed"
footer: "React 19 · Vite 6 · Tailwind CSS v4"
---

# Photography Portfolio
## Bilal Ahmed — Photographer & Visual Artist

Static HTML/CSS/JS → **React + Vite + Tailwind CSS**

---

## Project brief

A portfolio site for photographer Bilal Ahmed (portraits, editorial, architecture, street, nature, fine art) that was **converted from hand-written static files into a componentized React app**: one data file drives the whole gallery, filters and ratings run on React state, favorites/ratings/form drafts persist in `localStorage`, and **zero backend** is required — the production build is static files from `npm run build`.

**By the numbers:** 10 works · 7 categories + Favorites tab · 9 section components · 4 UI primitives · 2 hooks · 24 git commits

---

## Stack — `package.json`

```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "vite": "^6.3.5",
    "@vitejs/plugin-react": "^4.6.0",
    "tailwindcss": "^4.1.11",
    "@tailwindcss/vite": "^4.1.11"
  }
}
```

- **Vite 6** — dev server + static production build
- **React 19** — `useState`, `useMemo`, `useEffect`, controlled components
- **Tailwind v4** — `@import "tailwindcss"` + `@theme` design tokens
- **No backend** — persistence via `localStorage`, file download via `Blob`

---

## Architecture — `src/`

```
src/
├── App.jsx            → Header / Hero / Portfolio / About / Contact / Footer
├── main.jsx           → React 19 entry (StrictMode + createRoot)
├── index.css          → Tailwind import + @theme tokens (cream, ink, pine…)
├── data/
│   ├── works.js       → 10 works, single source of truth
│   └── site.js        → nav (4), press (6), stats (3), contact (3), types (5)
├── hooks/
│   ├── useFavorites.js    → liked ids ↔ localStorage
│   └── useLocalStorage.js → generic persisted state (ratings, drafts)
├── components/
│   ├── Header / Hero / Portfolio / About / Contact / Footer
│   ├── GalleryCard / FilterTabs / StarRating
│   └── ui/ Button, Container, Eyebrow, HeartIcon
```

One `Container` owns every page gutter: `px-4 → sm:px-6 → lg:px-8`, capped at `max-w-7xl`.

---

## Data-driven UI — `src/data/works.js`

No copy-pasted JSX — the grid renders from one array:

```js
export const WORKS = [
  { id: "theo-daylight", title: "Theo, in daylight",
    category: "portraits", span: "wide",
    src: "https://images.unsplash.com/photo-…",
    width: 1400, height: 900 },
  // …9 more: editorial, architecture, street,
  // nature, fine-art
];
```

```jsx
{filteredWorks.map((work) => (
  <GalleryCard key={work.id} work={work} /* … */ />
))}
```

Add a photo = add one object. Categories derive from the same file.

---

## State in action — filtering + controlled rating

```jsx
// Portfolio.jsx
const [activeFilter, setActiveFilter] = useState("all");
const filteredWorks = useMemo(
  () => activeFilter === "all"
    ? WORKS
    : WORKS.filter((w) => w.category === activeFilter),
  [activeFilter],
);
```

```jsx
// StarRating.jsx — controlled like a QuantityStepper:
// parent owns `value`, child only renders + notifies
<StarRating value={rating} onChange={setRating} />
```

Favorites tab reuses the same pipeline: `WORKS.filter((w) => favorites.includes(w.id))` + count badge + empty state.

---

## Persistence without a backend

| Feature | Key | Notes |
|---|---|---|
| Favorites (hearts) | `…:favorites:v1` | id array, syncs across tabs |
| Star ratings | `…:ratings:v1` | `{ workId: stars }` map |
| Contact draft | `…:contact-draft:v1` | autosaves every keystroke |
| Download copy | — | `Blob` → `inquiry-YYYY-MM-DD.txt`, gated on valid form |

```js
// useLocalStorage.js — the whole trick
const [value, setValue] = useState(() =>
  JSON.parse(localStorage.getItem(key)) ?? initialValue);
useEffect(() =>
  localStorage.setItem(key, JSON.stringify(value)), [key, value]);
```

Honest limit: browsers can't write to the *owner's* machine — real delivery needs a form-to-email POST (Formspree/Web3Forms).

---

## Responsive — mobile-first, no horizontal scroll

- Grid: `columns-1 → sm:columns-2 → lg:columns-3 → xl:columns-4` masonry — every image keeps its **native aspect**, zero cropping
- Type/layout scale unprefixed → `sm:` → `lg:` (verified in built CSS)
- `overflow-x-clip` on body + app shell, `min-w-0`, `truncate`/`break-all` on long strings
- Touch-first captions (always visible), hover zoom only as enhancement

```
✓ built in ~550ms → dist/index.html + hashed JS/CSS
```

---

## Proof of work — 24 incremental commits

```
chore: scaffold Vite + React + Tailwind base
feat: add portfolio data file and reusable UI primitives
feat: componentize … Header, Hero, Portfolio, About, Contact, Footer
refactor: centralize layout in reusable Container
refactor: optimize portfolio grid … / polish contact … / rebuild footer
fix: fit all image types with natural-aspect masonry …
feat: favorites tab with persisted likes … / persist star ratings …
style: ghost button … / professional SVG stars …
```

Plus: legacy `css/style.css` + `js/script.js` deleted, Tailwind fully wired, favicon served from `public/`.

---

## Next steps

1. **Delivery** — POST inquiries to Formspree/Web3Forms (validation stays as-is)
2. **Images** — local `srcset` / AVIF instead of hotlinked Unsplash URLs
3. **Tests** — filter logic, validation, hooks (Vitest + Testing Library)
4. **Deploy** — `npm run build` → Netlify/Vercel/GitHub Pages (static, free)

Thank you — questions?
