// PATCH /api/account/password — the signed-in user changes their own
// password.
//
// Security rules:
//   * scoped to session.user.id — never accepts a target user id;
//   * the CURRENT password must be provided and verified against the
//     stored bcrypt hash before anything is written, so a stolen
//     session alone can't lock the real owner out;
//   * the new password is hashed with bcrypt (cost 10) — the plain
//     value never touches the database or the response.
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma.js";
import { passwordChangeSchema, fieldErrors } from "@/lib/validation.js";

export async function PATCH(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "You must be signed in to change your password." },
      { status: 401 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = passwordChangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", fields: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true },
  });
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to change your password." },
      { status: 401 },
    );
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      {
        error: "Your current password is incorrect.",
        fields: { currentPassword: "This does not match your current password." },
      },
      { status: 400 },
    );
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/account/password failed:", error);
    return NextResponse.json(
      { error: "Could not change your password. Please try again." },
      { status: 500 },
    );
  }
}
