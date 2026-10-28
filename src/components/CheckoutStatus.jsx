"use client";

// Post-checkout status display for /checkout/success.
//
// The server has already loaded the REAL persisted order status — this
// component only re-reads it (GET /api/orders/[id]) a limited number
// of times while it is still PENDING, because the Stripe webhook can
// land a moment after the browser redirect. It never writes anything:
// only the verified webhook marks an order PAID.

import { useEffect, useState } from "react";
import Button from "./ui/Button.jsx";
import Badge from "./ui/Badge.jsx";
import { IconAlert, IconCheck, IconLoader } from "./ui/icons.jsx";
import { formatMoney } from "@/lib/money.js";
import { formatDate } from "@/lib/format.js";

const MAX_POLLS = 6;
const POLL_INTERVAL_MS = 2500;

export default function CheckoutStatus({ order }) {
  const [status, setStatus] = useState(order.status);
  const [polled, setPolled] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  // One poll per effect run while PENDING; bounded by MAX_POLLS.
  useEffect(() => {
    if (status !== "PENDING") return;
    if (polled >= MAX_POLLS) {
      setTimedOut(true);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      try {
        const response = await fetch(`/api/orders/${order.id}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          if (!cancelled && data.status && data.status !== "PENDING") {
            setStatus(data.status);
          }
        }
      } catch {
        // Transient network error — the next tick retries.
      }
      if (!cancelled) setPolled((n) => n + 1);
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [status, polled, order.id]);

  return (
    <div className="rounded-2xl border border-sand bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <StatusIcon status={status} timedOut={timedOut} />
          <div>
            <p className="font-display text-xl font-medium text-ink dark:text-cream">
              <StatusHeading status={status} timedOut={timedOut} />
            </p>
            <p className="mt-0.5 text-xs text-muted dark:text-white/50">
              Order {order.id}
            </p>
          </div>
        </div>
        <Badge tone={badgeTone(status)} dot>
          {status}
        </Badge>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted dark:text-white/65">
        <StatusMessage status={status} timedOut={timedOut} />
      </p>

      {/* Line items — snapshot values from the server, never re-priced. */}
      <ul className="mt-5 divide-y divide-sand border-t border-sand dark:divide-white/10 dark:border-white/10">
        {order.items.map((item) => (
          <li
            key={`${item.workTitle}-${item.quantity}`}
            className="flex items-baseline justify-between gap-4 py-3 text-sm"
          >
            <span className="min-w-0 text-ink dark:text-cream">
              <span className="font-semibold">{item.workTitle}</span>
              <span className="text-muted dark:text-white/50">
                {" "}
                × {item.quantity}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-muted dark:text-white/65">
              {formatMoney(item.lineTotalCents, order.currency)}
            </span>
          </li>
        ))}
        <li className="flex items-baseline justify-between gap-4 py-3 text-sm">
          <span className="font-display text-base font-medium text-ink dark:text-cream">
            Total
          </span>
          <span className="shrink-0 text-base font-semibold tabular-nums text-ink dark:text-cream">
            {formatMoney(order.totalCents, order.currency)}
          </span>
        </li>
      </ul>

      {order.paidAt ? (
        <p className="mt-3 text-xs text-muted dark:text-white/50">
          Paid {formatDate(order.paidAt)}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/#work" variant="primary">
          Back to the gallery
        </Button>
        {status !== "PAID" ? (
          <Button href="/#contact" variant="secondary">
            Contact the studio
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function StatusIcon({ status, timedOut }) {
  if (status === "PAID") {
    return (
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-success ring-1 ring-green-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/25">
        <IconCheck className="h-5 w-5" />
      </span>
    );
  }
  if (status === "FAILED" || status === "CANCELLED" || timedOut) {
    return (
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-error ring-1 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-300/25">
        <IconAlert className="h-5 w-5" />
      </span>
    );
  }
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sand/60 text-pine ring-1 ring-sand dark:bg-white/10 dark:text-emerald-300 dark:ring-white/10">
      <IconLoader className="h-5 w-5 animate-spin" />
    </span>
  );
}

function StatusHeading({ status, timedOut }) {
  if (status === "PAID") return "Payment confirmed";
  if (status === "FAILED") return "Payment failed";
  if (status === "CANCELLED") return "Order cancelled";
  if (timedOut) return "Confirmation still pending";
  return "Confirming your payment…";
}

function StatusMessage({ status, timedOut }) {
  if (status === "PAID") {
    return "Thank you — your order is paid and confirmed. A copy of this confirmation is stored with your account.";
  }
  if (status === "FAILED") {
    return "Stripe could not complete this payment, so the order was not fulfilled. You can try again from the gallery or get in touch if you need a hand.";
  }
  if (status === "CANCELLED") {
    return "This order was cancelled. Nothing has been charged for it.";
  }
  if (timedOut) {
    return "We haven't received Stripe's confirmation for this order yet. If your payment went through, it will be confirmed shortly — there's no need to pay again. This page shows the real stored order status, not the browser redirect.";
  }
  return "We're verifying the payment with Stripe. This page checks the order status automatically for a few moments.";
}

function badgeTone(status) {
  if (status === "PAID") return "success";
  if (status === "FAILED" || status === "CANCELLED") return "danger";
  return "warn";
}
