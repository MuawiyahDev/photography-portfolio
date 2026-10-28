// GET /api/orders/[id] — the signed-in owner's view of one order.
//
// Ownership is enforced here (where clause on userId), so an order id
// from another account returns 404 without revealing it exists.
// The payload is the UI-safe summary only: no Stripe ids, no secrets,
// and it NEVER mutates status — the success page polls this endpoint.
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOwnedOrder, toOrderSummary } from "@/lib/orders.js";
import { orderIdSchema } from "@/lib/validation.js";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "You must be signed in to view an order." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const parsed = orderIdSchema.safeParse(id);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  try {
    const order = await getOwnedOrder(parsed.data, session.user.id);
    if (!order) {
      // Same 404 for "doesn't exist" and "not yours" — no probing.
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json(toOrderSummary(order));
  } catch (error) {
    console.error("GET /api/orders/[id] failed:", error);
    return NextResponse.json(
      { error: "Could not load the order." },
      { status: 500 },
    );
  }
}
