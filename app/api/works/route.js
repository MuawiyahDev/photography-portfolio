// GET  /api/works — public: everyone can browse the portfolio.
// POST /api/works — admin only: add a new work to the database.
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma.js";
import { getAllWorks, toPublicWork } from "@/lib/works.js";
import { categoryExists } from "@/lib/categories.js";
import { workSchema, fieldErrors } from "@/lib/validation.js";

export async function GET() {
  try {
    const works = await getAllWorks();
    return NextResponse.json(works);
  } catch (error) {
    console.error("GET /api/works failed:", error);
    return NextResponse.json(
      { error: "Could not load works right now." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  // Check the session cookie FIRST — never trust anything the client
  // sends about who they are; `auth()` reads and verifies the cookie.
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 },
    );
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 },
    );
  }

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

  // The category must exist in the Category table (tabs are DB-managed).
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
    // P2002 = unique constraint failed (duplicate slug).
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A work with this slug already exists." },
        { status: 409 },
      );
    }
    console.error("POST /api/works failed:", error);
    return NextResponse.json(
      { error: "Could not save the work." },
      { status: 500 },
    );
  }
}
