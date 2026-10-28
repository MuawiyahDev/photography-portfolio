// Stripe singleton — SERVER ONLY.
//
// The Stripe secret key and webhook signing secret live exclusively in
// server environment variables; this module is never imported by a
// "use client" file. Keys are validated on first use so a missing
// config fails loudly at the checkout/webhook call site, not silently
// in the browser.
import Stripe from "stripe";

let cached = null;

function readSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add your Stripe TEST-mode secret key " +
        "(sk_test_…) to .env — see .env.example.",
    );
  }
  if (key.startsWith("whsec_")) {
    throw new Error(
      "STRIPE_SECRET_KEY looks like a webhook secret (whsec_…). " +
        "Put that value in STRIPE_WEBHOOK_SECRET instead.",
    );
  }
  // Test mode only for this assessment — refuse live keys outside prod.
  if (!key.startsWith("sk_test_") && process.env.NODE_ENV !== "production") {
    throw new Error(
      "STRIPE_SECRET_KEY must be a TEST-mode key (sk_test_…) outside production.",
    );
  }
  if (!key.startsWith("sk_test_")) {
    console.warn("[stripe] STRIPE_SECRET_KEY is not a test-mode key.");
  }
  return key;
}

/** Lazily construct one Stripe client (safe across dev hot reloads). */
export function getStripe() {
  if (cached) return cached;
  cached = new Stripe(readSecretKey());
  return cached;
}

/**
 * Canonical site origin used for Stripe return URLs.
 * NEXT_PUBLIC_SITE_URL (e.g. http://localhost:3000), no trailing slash.
 */
export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = raw.replace(/\/+$/, "");
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL is not a valid URL: "${raw}"`);
  }
  if (process.env.NODE_ENV !== "production" && parsed.protocol !== "https:") {
    // fine for local dev over http
  }
  return url;
}

/** The webhook signing secret (whsec_…) — server only, never returned. */
export function webhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not set. Use the signing secret printed by " +
        "`stripe listen --forward-to …` (whsec_…) — see .env.example.",
    );
  }
  return secret;
}

/**
 * Scrub anything key-shaped out of a message before logging — Stripe's
 * own error strings embed a partial API key ("sk_test_…"), and logs
 * must never carry credential material, even partial.
 */
export function redactSecrets(message) {
  return String(message ?? "")
    .replace(/sk_(?:live|test)_[A-Za-z0-9*]+/g, "sk_***")
    .replace(/whsec_[A-Za-z0-9*]+/g, "whsec_***")
    .replace(/rk_(?:live|test)_[A-Za-z0-9*]+/g, "rk_***");
}
