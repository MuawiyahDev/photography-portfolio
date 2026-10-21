import { prisma } from "./prisma.js";
import { attachCategoryLabels } from "./categories.js";

/**
 * Convert a database Work row into the shape the UI already expects.
 * The public `id` is the slug (e.g. "theo-daylight") — the same ids
 * existing visitors already have saved in localStorage favorites/ratings.
 */
export function toPublicWork(work) {
  return {
    id: work.slug,
    title: work.title,
    category: work.category,
    src: work.src,
    alt: work.alt,
    width: work.width,
    height: work.height,
    span: work.span,
    description: work.description ?? null,
    link: work.link ?? null,
  };
}

/**
 * All portfolio works, oldest first (stable gallery order), with the
 * DB-managed `categoryLabel` attached for badges and tabs.
 * Used by the home page (Server Component) and the API routes.
 */
export async function getAllWorks() {
  const rows = await prisma.work.findMany({
    orderBy: { createdAt: "asc" },
  });
  return attachCategoryLabels(rows.map(toPublicWork));
}
