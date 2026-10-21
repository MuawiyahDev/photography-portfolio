import { prisma } from "./prisma.js";

/**
 * A user's ratings as { workSlug: value } — read on the server by the
 * home page so stars appear in the initial HTML (no client fetch).
 */
export async function getRatingsBySlug(userId) {
  const ratings = await prisma.rating.findMany({
    where: { userId },
    include: { work: { select: { slug: true } } },
  });
  return Object.fromEntries(ratings.map((r) => [r.work.slug, r.value]));
}
