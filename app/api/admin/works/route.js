// POST /api/admin/works — create a portfolio work (admin only).
// (GET /api/works and POST /api/works remain the course's public API;
//  the dashboard uses the /api/admin namespace for all management.)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import { adminApiGuard } from "@/lib/admin.js";
import { toPublicWork } from "@/lib/works.js";
import { categoryExists } from "@/lib/categories.js";
import { workSchema, fieldErrors } from "@/lib/validation.js";

export async function POST(request) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = workSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", fields: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  // Tabs are DB-managed: reject writes pointing at unknown categories.
  if (!(await categoryExists(parsed.data.category))) {
    return NextResponse.json(
      {
        error: "Invalid input.",
        fields: { category: "Unknown category — choose an existing one." },
      },
      { status: 400 },
    );
  }

  try {
    const created = await prisma.work.create({
      data: {
        ...parsed.data,
        span: parsed.data.span ?? null,
        description: parsed.data.description ?? null,
        link: parsed.data.link ?? null,
      },
    });
    return NextResponse.json(toPublicWork(created), { status: 201 });
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A work with this slug already exists." },
        { status: 409 },
      );
    }
    console.error("POST /api/admin/works failed:", error);
    return NextResponse.json(
      { error: "Could not save the work." },
      { status: 500 },
    );
  }
}
