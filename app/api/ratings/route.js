// GET  /api/ratings — signed-in user: their ratings as { slug: value }.
// POST /api/ratings — rate a work { "slug": "golden-hour", "value": 4 };
//                     value 0 removes the rating.
//
// Ratings are account-based (like favorites): unauthenticated
// requests get 401 and the client sends the visitor to login.
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma.js";
import { getRatingsBySlug } from "@/lib/ratings.js";
import { ratingSchema, fieldErrors } from "@/lib/validation.js";

async function requireUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to view ratings." },
      { status: 401 },
    );
  }

  try {
    const ratings = await getRatingsBySlug(user.id);
    return NextResponse.json(ratings);
  } catch (error) {
    console.error("GET /api/ratings failed:", error);
    return NextResponse.json(
      { error: "Could not load ratings." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to rate works." },
      { status: 401 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = ratingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", fields: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const { slug, value } = parsed.data;

  try {
    const work = await prisma.work.findUnique({ where: { slug } });
    if (!work) {
      return NextResponse.json({ error: "Work not found." }, { status: 404 });
    }

    if (value === 0) {
      // Un-rating: deleteMany never throws when nothing matches.
      await prisma.rating.deleteMany({
        where: { userId: user.id, workId: work.id },
      });
      return NextResponse.json({ slug, value: 0 });
    }

    // Upsert = create or update to the new star count.
    await prisma.rating.upsert({
      where: { userId_workId: { userId: user.id, workId: work.id } },
      update: { value },
      create: { userId: user.id, workId: work.id, value },
    });

    return NextResponse.json({ slug, value }, { status: 201 });
  } catch (error) {
    console.error("POST /api/ratings failed:", error);
    return NextResponse.json(
      { error: "Could not save the rating." },
      { status: 500 },
    );
  }
}
