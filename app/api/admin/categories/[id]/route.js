// PATCH   /api/admin/categories/[id] — rename/reorder (admin only).
// DELETE  /api/admin/categories/[id] — remove when unused (admin only).
// The slug is never editable: works reference it.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import { adminApiGuard } from "@/lib/admin.js";
import { categoryUpdateSchema, fieldErrors } from "@/lib/validation.js";

export async function PATCH(request, { params }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = categoryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", fields: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: { label: parsed.data.label, order: parsed.data.order },
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 },
      );
    }
    console.error("PATCH /api/admin/categories failed:", error);
    return NextResponse.json(
      { error: "Could not update the category." },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;

  const { id } = await params;

  try {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 },
      );
    }

    // Never strand gallery works: block deletion while in use.
    const inUse = await prisma.work.count({
      where: { category: category.slug },
    });
    if (inUse > 0) {
      return NextResponse.json(
        {
          error: `“${category.label}” is used by ${inUse} work${inUse === 1 ? "" : "s"}. Reassign them first.`,
        },
        { status: 409 },
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 },
      );
    }
    console.error("DELETE /api/admin/categories failed:", error);
    return NextResponse.json(
      { error: "Could not delete the category." },
      { status: 500 },
    );
  }
}
