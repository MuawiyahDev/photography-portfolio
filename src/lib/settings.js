// Site settings (hero / about / contact) — the data layer for both
// the public site and the admin dashboard.
import { cache } from "react";
import { prisma } from "./prisma.js";

export const SETTING_KEYS = ["hero", "about", "contact"];

/**
 * All three sections in one query.
 * Wrapped in React's `cache()` so the layout and the page — which both
 * need this data — share a single database query per request.
 */
export const getSiteSettings = cache(async () => {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: SETTING_KEYS } },
  });
  return Object.fromEntries(rows.map((row) => [row.key, row.data]));
});

/** A single section (used by the admin edit pages). */
export const getSetting = cache(async (key) => {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.data ?? null;
});
