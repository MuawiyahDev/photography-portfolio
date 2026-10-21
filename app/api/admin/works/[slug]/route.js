// PATCH   /api/admin/works/[slug] — edit a work (admin only).
// DELETE  /api/admin/works/[slug] — remove a work (admin only).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import { adminApiGuard } from "@/lib/admin.js";
import { toPublicWork } from "@/lib/works.js";
import { categoryExists } from "@/lib/categories.js";
import { workUpdateSchema, fieldErrors } from "@/lib/validation.js";

export async function PATCH(request, { params }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;

  const { slug } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = workUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", fields: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  // Changing the category must land on an existing tab.
  if (
    parsed.data.category !== undefined &&
    !(await categoryExists(parsed.data.category))
  ) {
    return NextResponse.json(
      {
        error: "Invalid input.",
        fields: { category: "Unknown category — choose an existing one." },
      },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.work.update({
      where: { slug },
      data: {
        ...parsed.data,
        ...(parsed.data.span !== undefined ? { span: parsed.data.span ?? null } : {}),
      },
    });
    return NextResponse.json(toPublicWork(updated));
  } catch (error) {
    // P2025 = record not found.
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Work not found." }, { status: 404 });
    }
    console.error("PATCH /api/admin/works failed:", error);
    return NextResponse.json(
      { error: "Could not update the work." },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;

  const { slug } = await params;

  try {
    await prisma.work.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Work not found." }, { status: 404 });
    }
    console.error("DELETE /api/admin/works failed:", error);
    return NextResponse.json(
      { error: "Could not delete the work." },
      { status: 500 },
    );
  }
}
