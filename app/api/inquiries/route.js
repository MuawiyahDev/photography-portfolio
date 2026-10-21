// POST /api/inquiries — public: any visitor can send a booking inquiry.
// GET  /api/inquiries — admin only: read all stored inquiries.
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma.js";
import { inquirySchema, fieldErrors } from "@/lib/validation.js";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", fields: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const inquiry = await prisma.inquiry.create({ data: parsed.data });
    return NextResponse.json(
      { inquiry: { id: inquiry.id, createdAt: inquiry.createdAt } },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/inquiries failed:", error);
    return NextResponse.json(
      { error: "Could not save your inquiry." },
      { status: 500 },
    );
  }
}

export async function GET() {
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

  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(inquiries);
  } catch (error) {
    console.error("GET /api/inquiries failed:", error);
    return NextResponse.json(
      { error: "Could not load inquiries." },
      { status: 500 },
    );
  }
}
