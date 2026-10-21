// POST /api/admin/categories — create a portfolio tab (admin only).
// Slug is optional: derived from the label when omitted.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import { adminApiGuard } from "@/lib/admin.js";
import { getAllCategories, slugify } from "@/lib/categories.js";
import { categoryCreateSchema, fieldErrors } from "@/lib/validation.js";

export async function POST(request) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = categoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", fields: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const slug = parsed.data.slug || slugify(parsed.data.label);
  if (!slug) {
    return NextResponse.json(
      {
        error: "Invalid input.",
        fields: { label: "Label must contain letters or numbers." },
      },
      { status: 400 },
    );
  }

  try {
    // Default position: after the last category.
    let order = parsed.data.order;
    if (order === undefined) {
      const existing = await getAllCategories();
      order = existing.length
        ? Math.max(...existing.map((c) => c.order)) + 1
        : 0;
    }

    const created = await prisma.category.create({
      data: { slug, label: parsed.data.label, order },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A category with this slug already exists." },
        { status: 409 },
      );
    }
    console.error("POST /api/admin/categories failed:", error);
    return NextResponse.json(
      { error: "Could not save the category." },
      { status: 500 },
    );
  }
}
