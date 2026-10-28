"use client";

// Buy-print button for a gallery card.
//
// The browser only sends the photograph's slug + quantity + a random
// per-attempt id — the server looks the price up itself, creates a
// PENDING order, and returns a Stripe-hosted Checkout URL that we
// navigate to. Nothing here ever claims the order is paid.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiSend } from "@/lib/api.js";
import Button from "./ui/Button.jsx";

export default function BuyButton({
  slug,
  quantity = 1,
  className = "",
  children = "Buy print",
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleBuy = async () => {
    // Hard guard against accidental double clicks (Button also
    // disables itself via `busy`).
    if (busy) return;
    setBusy(true);
    setError("");

    // Random id per attempt: the server dedupes retries/double
    // submissions that carry it (unique index on Order.requestId).
    const requestId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    let navigating = false;
    try {
      const result = await apiSend("/api/checkout", {
        method: "POST",
        body: { slug, quantity, requestId },
      });

      if (result.ok && result.data?.url) {
        // Stay busy while the browser navigates to Stripe Checkout.
        navigating = true;
        window.location.assign(result.data.url);
        return;
      }

      if (result.status === 401) {
        // Session expired — sign in, then come back to the gallery.
        navigating = true;
        router.push("/login");
        return;
      }

      setError(
        result.data?.error ?? "Could not start checkout — please try again.",
      );
    } catch {
      setError("Network error — please try again.");
    } finally {
      // Unlock only when NOT navigating away, so a slow redirect
      // can't be double-submitted.
      if (!navigating) setBusy(false);
    }
  };

  return (
    <span className={`flex flex-col items-end gap-1 ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        busy={busy}
        onClick={handleBuy}
        className="border-white/40 bg-white/95 text-ink hover:border-white hover:bg-white hover:text-ink dark:border-white/30 dark:bg-cream/95 dark:text-coal dark:hover:text-coal! dark:hover:bg-cream"
        aria-label={`Buy a print of this photograph for ${quantity === 1 ? "one copy" : `${quantity} copies`}`}
      >
        {children}
      </Button>
      {error ? (
        <span
          role="alert"
          className="max-w-[16rem] text-right text-[0.7rem] font-medium leading-tight text-rose-200"
        >
          {error}
        </span>
      ) : null}
    </span>
  );
}
