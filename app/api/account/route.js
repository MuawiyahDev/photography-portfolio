// PATCH /api/account — the signed-in user updates their own name and
// email.
//
// Ownership: the WHERE clause is always session.user.id — there is no
// id in the request body, so a caller can only ever modify their own
// row. The password is intentionally NOT changeable here; that lives
// in /api/account/password behind a current-password check.
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma.js";
import { accountUpdateSchema, fieldErrors } from "@/lib/validation.js";

export async function PATCH(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "You must be signed in to update your account." },
      { status: 401 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = accountUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", fields: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const { name, email } = parsed.data;

  // Friendlier 409 than the unique constraint below — but only when
  // the email actually changes; keeping your own email is not a
  // conflict.
  if (email !== session.user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
          fields: { email: "This email is already in use." },
        },
        { status: 409 },
      );
    }
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, email },
      // Never select or return passwordHash.
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json({ user });
  } catch (error) {
    // Unique index race: another account claimed the email between the
    // check above and the write.
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
          fields: { email: "This email is already in use." },
        },
        { status: 409 },
      );
    }
    console.error("PATCH /api/account failed:", error);
    return NextResponse.json(
      { error: "Could not save your changes. Please try again." },
      { status: 500 },
    );
  }
}
