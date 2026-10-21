// GET    /api/favorites — signed-in user: slugs of their saved works.
// POST   /api/favorites — save a work   { "slug": "golden-hour" }.
// DELETE /api/favorites — remove a save { "slug": "golden-hour" }.
//
// Every method starts by reading the session cookie with auth().
// Unauthenticated requests get 401 — the client reacts by sending
// the visitor to the login page.
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma.js";
import { getFavoriteSlugs } from "@/lib/favorites.js";
import { favoriteSchema, fieldErrors } from "@/lib/validation.js";

async function requireUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

// Shared body parsing: returns { user } or a ready 401/400 response.
async function readRequest(request) {
  const user = await requireUser();
  if (!user) {
    return { error: NextResponse.json(
      { error: "You must be signed in to save favorites." },
      { status: 401 },
    ) };
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return { error: NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    ) };
  }

  const parsed = favoriteSchema.safeParse(body);
  if (!parsed.success) {
    return { error: NextResponse.json(
      { error: "Invalid input.", fields: fieldErrors(parsed.error) },
      { status: 400 },
    ) };
  }

  return { user, slug: parsed.data.slug };
}

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to view favorites." },
      { status: 401 },
    );
  }

  try {
    const slugs = await getFavoriteSlugs(user.id);
    return NextResponse.json(slugs);
  } catch (error) {
    console.error("GET /api/favorites failed:", error);
    return NextResponse.json(
      { error: "Could not load favorites." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const { error, user, slug } = await readRequest(request);
  if (error) return error;

  try {
    const work = await prisma.work.findUnique({ where: { slug } });
    if (!work) {
      return NextResponse.json(
        { error: "Work not found." },
        { status: 404 },
      );
    }

    // Upsert = create if missing, do nothing if it already exists.
    await prisma.favorite.upsert({
      where: { userId_workId: { userId: user.id, workId: work.id } },
      update: {},
      create: { userId: user.id, workId: work.id },
    });

    return NextResponse.json({ slug, favorited: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/favorites failed:", error);
    return NextResponse.json(
      { error: "Could not save favorite." },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  const { error, user, slug } = await readRequest(request);
  if (error) return error;

  try {
    const work = await prisma.work.findUnique({ where: { slug } });
    if (!work) {
      return NextResponse.json(
        { error: "Work not found." },
        { status: 404 },
      );
    }

    // deleteMany never throws when nothing matches — safe to run twice.
    await prisma.favorite.deleteMany({
      where: { userId: user.id, workId: work.id },
    });

    return NextResponse.json({ slug, favorited: false });
  } catch (error) {
    console.error("DELETE /api/favorites failed:", error);
    return NextResponse.json(
      { error: "Could not remove favorite." },
      { status: 500 },
    );
  }
}
