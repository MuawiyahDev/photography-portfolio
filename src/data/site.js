// Site-wide static configuration.
// Editable content (hero, about, contact, works) now lives in
// PostgreSQL and is managed through the admin dashboard —
// see prisma/seed.js for the original default values.

export const NAV_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#work", label: "Portfolio" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export const PROJECT_TYPES = [
  { value: "portrait", label: "Portrait session" },
  { value: "wedding", label: "Wedding / event" },
  { value: "editorial", label: "Editorial / commercial" },
  { value: "fine-art", label: "Fine art commission" },
  { value: "other", label: "Something else" },
];
