// Seed script — copies the original hardcoded content into PostgreSQL.
// Safe to rerun: works are upserted by slug, settings and the admin
// account are only created when missing — existing CMS edits are kept.
//
// Usage: npm run db:seed   (or: npx prisma db seed)

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { WORKS, CATEGORIES } from "../src/data/works.js";

const prisma = new PrismaClient();

// Default gallery categories (the portfolio filter tabs). Upserted by
// slug; `update: {}` keeps any renames/reorders made in the dashboard.
async function seedCategories() {
  let created = 0;
  let updated = 0;

  const defaults = CATEGORIES.filter((c) => c.value !== "all");
  for (const [index, category] of defaults.entries()) {
    const result = await prisma.category.upsert({
      where: { slug: category.value },
      update: {},
      create: {
        slug: category.value,
        label: category.label,
        order: index,
      },
    });
    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created += 1;
    } else {
      updated += 1;
    }
  }

  console.log(`Categories: ${created} created, ${updated} already present.`);
}

async function seedWorks() {
  let created = 0;
  let updated = 0;

  for (const work of WORKS) {
    const data = {
      title: work.title,
      category: work.category,
      src: work.src,
      alt: work.alt,
      width: work.width,
      height: work.height,
      span: work.span ?? null,
    };

    const result = await prisma.work.upsert({
      where: { slug: work.id },
      // Never overwrite description/link — those are edited in the CMS.
      update: data,
      create: {
        slug: work.id,
        ...data,
        description: work.description ?? null,
        link: work.link ?? null,
      },
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created += 1;
    } else {
      updated += 1;
    }
  }

  console.log(`Works: ${created} created, ${updated} updated.`);
}

// Default print prices (integer cents) for the seeded gallery.
// Applied ONLY to works that have no price yet (priceCents IS NULL),
// so a price an admin sets in the dashboard is never overwritten by
// a reseed. Works without an entry here are simply not for sale.
const DEFAULT_PRINT_PRICES = {
  "theo-daylight": 5500,
  "golden-hour": 5500,
  "white-museum": 4500,
  "rush-hour": 4500,
  "cedar-path": 4000,
  "jonas": 5500,
  "glass-grid": 4500,
  "blue-hour": 6500,
  "first-fog": 6500,
  "ochre-study": 7500,
};

async function seedPrintPrices() {
  let set = 0;
  for (const [slug, priceCents] of Object.entries(DEFAULT_PRINT_PRICES)) {
    const result = await prisma.work.updateMany({
      where: { slug, priceCents: null },
      data: { priceCents },
    });
    set += result.count;
  }
  console.log(
    `Print prices: ${set} set (existing prices left untouched).`,
  );
}

// The original hardcoded content from src/data/site.js, as the first
// version of the CMS-managed sections. `update: {}` means a rerun will
// NOT overwrite anything the admin has edited in the dashboard.
const DEFAULT_SETTINGS = {
  hero: {
    eyebrow: "Photographer & Visual Artist — Portland / Available worldwide",
    heading: "Light, form & quiet moments.",
    subheading:
      "I'm Bilal Ahmed. I photograph people, places, and the in-between — portraits and editorial stories told with natural light and a calm, minimal eye.",
    primaryCta: { text: "View Portfolio", href: "#work" },
    secondaryCta: { text: "Book a Shoot", href: "#contact" },
    image: {
      src: "https://images.unsplash.com/photo-1480429370139-e0132c086e2a?q=80&w=1200&auto=format&fit=crop",
      alt: "Editorial fashion portrait of a young man in soft window light",
      caption: "Editorial — “Northern Light”, 2025",
      width: 900,
      height: 1150,
    },
    stats: [
      { label: "Years", value: "12" },
      { label: "Editorials", value: "60+" },
      { label: "Exhibitions", value: "14" },
    ],
    press: [
      "Vogue",
      "GQ",
      "National Geographic",
      "ELLE",
      "Vanity Fair",
      "TIME",
    ],
  },
  about: {
    eyebrow: "About",
    heading: "A calm eye for real life.",
    paragraphs: [
      "I'm Bilal Ahmed, a photographer and visual artist based in Portland. For the past twelve years I've shot portraits, editorials, and spaces — always chasing honest light and unforced moments.",
      "My work has appeared in print and on gallery walls, but most days you'll find me on location with a small crew: one camera, available light, and room for people to be themselves.",
    ],
    ctaText: "Tell me about your project →",
    ctaHref: "#contact",
    image: {
      src: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=800&auto=format&fit=crop",
      alt: "Bilal Ahmed holding a camera on location at dusk",
      width: 800,
      height: 1000,
    },
  },
  contact: {
    eyebrow: "Contact — bookings open for 2026",
    heading: "Book a Shoot",
    blurb:
      "Portraits, weddings, editorial assignments, and commissions. Share a few details and I'll reply within two working days.",
    details: [
      {
        label: "Email",
        type: "email",
        value: "hello@bilalahmed.photo",
        href: "mailto:hello@bilalahmed.photo",
      },
      {
        label: "Studio",
        type: "text",
        value: "214 SE Alder St, Portland, OR",
        href: "",
      },
      {
        label: "Phone",
        type: "phone",
        value: "+1 (503) 555-0194",
        href: "tel:+15035550194",
      },
    ],
    socials: [],
  },
};

async function seedSettings() {
  let created = 0;
  for (const [key, data] of Object.entries(DEFAULT_SETTINGS)) {
    const result = await prisma.siteSetting.upsert({
      where: { key },
      update: {}, // keep any CMS edits on rerun
      create: { key, data },
    });
    // upsert with update:{} — createdAt === updatedAt only when just created.
    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created += 1;
    }
  }
  console.log(
    created > 0
      ? `Settings: ${created} section(s) created (existing edits kept).`
      : "Settings: already present (your CMS edits were kept).",
  );
}

async function seedAdmin() {
  // Optional: set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create
  // (or update) the admin account that may manage content via the CMS.
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "Admin: skipped (set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create one).",
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email: email.toLowerCase(),
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Admin: ready (${email}).`);
}

async function main() {
  await seedCategories();
  await seedWorks();
  await seedPrintPrices();
  await seedSettings();
  await seedAdmin();
}

main()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
