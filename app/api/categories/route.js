// GET /api/categories — public: the portfolio filter tabs, in order.
import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/categories.js";

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(
      categories.map((c) => ({ slug: c.slug, label: c.label, order: c.order })),
    );
  } catch (error) {
    console.error("GET /api/categories failed:", error);
    return NextResponse.json(
      { error: "Could not load categories right now." },
      { status: 500 },
    );
  }
}
