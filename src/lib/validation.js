// Server-side input validation with Zod.
// Every API route validates request data with one of these schemas
// before touching the database. Category values are validated for
// shape here and for existence against the Category table in the
// routes (async), so tabs always come from the database.

import { z } from "zod";
import { PROJECT_TYPES } from "../data/site.js";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROJECT_TYPE_VALUES = PROJECT_TYPES.map((t) => t.value);

// Registration: name ≥ 2 chars, valid email (normalized to lowercase),
// password ≥ 8 chars (hashed with bcrypt before storage — never saved plain).
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(100),
});

// Login: only checks shape here; the auth library verifies the hash.
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

// A portfolio work created via POST /api/works or the admin dashboard.
export const workSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug must be lowercase words separated by hyphens",
    ),
  title: z.string().trim().min(1).max(200),
  // Category is a slug string; routes verify it exists in the
  // Category table (async check — zod enums can't await the DB).
  category: z.string().trim().min(1).max(64).regex(SLUG_PATTERN),
  src: z.string().url(),
  alt: z.string().trim().min(1).max(500),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  span: z.enum(["wide", "tall"]).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  link: z.string().trim().max(500).nullable().optional(),
});

// Editing an existing work: every field optional, same rules when present.
export const workUpdateSchema = workSchema
  .partial()
  .omit({ slug: true }); // the slug is the URL — it identifies the row

// A booking inquiry from the contact form (public).
export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  projectType: z.enum(PROJECT_TYPE_VALUES),
  message: z.string().trim().min(20).max(5000),
});

// A favorite toggle from the gallery heart button (signed-in users only).
export const favoriteSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid work slug"),
});

// A star rating from the gallery (signed-in users only).
// value 0 means "remove my rating" and deletes the row.
export const ratingSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid work slug"),
  value: z.number().int().min(0).max(5),
});

// Dashboard: create a category/tab. Slug is optional — the route
// derives it from the label when omitted.
export const categoryCreateSchema = z.object({
  label: z.string().trim().min(1).max(40),
  slug: z
    .string()
    .trim()
    .max(64)
    .regex(SLUG_PATTERN, "slug must be lowercase words separated by hyphens")
    .or(z.literal(""))
    .optional(),
  order: z.number().int().min(0).max(9999).optional(),
});

// Dashboard: rename/reorder a category. The slug never changes —
// works reference it.
export const categoryUpdateSchema = z.object({
  label: z.string().trim().min(1).max(40),
  order: z.number().int().min(0).max(9999),
});

// Dashboard: change an account's role (promote/demote admin).
// The route additionally blocks changing your own role.
export const userRoleUpdateSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

// ---------------------------------------------------------------------------
// Admin CMS — schemas for the editable site sections (SiteSetting.data).
// Each mirrors exactly what the public components render.
// ---------------------------------------------------------------------------

const imageUrl = z.string().trim().url();

export const heroSettingSchema = z.object({
  eyebrow: z.string().trim().min(1).max(200),
  heading: z.string().trim().min(1).max(200),
  subheading: z.string().trim().min(1).max(1000),
  primaryCta: z.object({
    text: z.string().trim().min(1).max(60),
    href: z.string().trim().min(1).max(300),
  }),
  secondaryCta: z.object({
    text: z.string().trim().min(1).max(60),
    href: z.string().trim().min(1).max(300),
  }),
  image: z.object({
    src: imageUrl,
    alt: z.string().trim().min(1).max(300),
    caption: z.string().trim().max(300),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  stats: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(40),
        value: z.string().trim().min(1).max(20),
      }),
    )
    .max(8),
  press: z.array(z.string().trim().min(1).max(60)).max(12),
});

export const aboutSettingSchema = z.object({
  eyebrow: z.string().trim().min(1).max(100),
  heading: z.string().trim().min(1).max(200),
  paragraphs: z.array(z.string().trim().min(1).max(2000)).min(1).max(6),
  ctaText: z.string().trim().min(1).max(80),
  ctaHref: z.string().trim().min(1).max(300),
  image: z.object({
    src: imageUrl,
    alt: z.string().trim().min(1).max(300),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
});

const contactDetailSchema = z.object({
  label: z.string().trim().min(1).max(40),
  type: z.enum(["email", "text", "phone"]),
  value: z.string().trim().min(1).max(200),
  href: z.string().trim().max(300),
});

export const contactSettingSchema = z.object({
  eyebrow: z.string().trim().min(1).max(120),
  heading: z.string().trim().min(1).max(120),
  blurb: z.string().trim().min(1).max(500),
  details: z.array(contactDetailSchema).min(1).max(8),
  socials: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(40),
        href: z.string().trim().min(1).max(300),
      }),
    )
    .max(8),
});

// Which schema validates which settings key.
export const settingSchemas = {
  hero: heroSettingSchema,
  about: aboutSettingSchema,
  contact: contactSettingSchema,
};

// Turn a Zod error into a simple { fieldName: "message" } object
// that the frontend can display next to each field.
export function fieldErrors(error) {
  const out = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
