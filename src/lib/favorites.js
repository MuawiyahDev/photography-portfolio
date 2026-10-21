import { prisma } from "./prisma.js";

/**
 * The slugs of every work a user has favorited, oldest first.
 * Called by the home page (Server Component) so the favorites are
 * part of the initial HTML — no client-side fetch needed.
 */
export async function getFavoriteSlugs(userId) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { work: { select: { slug: true } } },
    orderBy: { createdAt: "asc" },
  });
  return favorites.map((f) => f.work.slug);
}
