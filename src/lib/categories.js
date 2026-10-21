// Category (portfolio tab) data access. Everything user-facing about
// tabs reads from PostgreSQL through these helpers — nothing about
// categories is hardcoded in the UI anymore.
import { cache } from "react";
import { prisma } from "./prisma.js";

/**
 * All categories in display order (dashboard "order", then label).
 * Cached per request so the page, layout, and components share one query.
 */
export const getAllCategories = cache(async () => {
  return prisma.category.findMany({
    orderBy: [{ order: "asc" }, { label: "asc" }],
  });
});

/** { slug → label } map for rendering badges/headings. */
export const getCategoryLabelMap = cache(async () => {
  const categories = await getAllCategories();
  return Object.fromEntries(categories.map((c) => [c.slug, c.label]));
});

/**
 * Attach `categoryLabel` to public work objects (falls back to the raw
 * slug for works whose category was removed outside the dashboard).
 */
export async function attachCategoryLabels(works) {
  const labels = await getCategoryLabelMap();
  return works.map((work) => ({
    ...work,
    categoryLabel: labels[work.category] ?? work.category,
  }));
}

/** URL-safe slug derived from a label ("Fine Art" → "fine-art"). */
export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** True when a category with this slug exists (work write validation). */
export async function categoryExists(slug) {
  const row = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });
  return Boolean(row);
}
