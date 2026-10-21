// PATCH   /api/admin/users/[id] — change an account's role (admin only).
// DELETE  /api/admin/users/[id] — remove an account (admin only).
//
// Safety rails: you can never change your own role or delete yourself,
// so the dashboard can't lock itself out. Deleting a user cascades
// their favorites (schema: onDelete: Cascade).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import { adminApiGuard } from "@/lib/admin.js";
import { userRoleUpdateSchema } from "@/lib/validation.js";

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

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

  const parsed = userRoleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid role. Must be USER or ADMIN." },
      { status: 400 },
    );
  }

  if (id === guard.user.id) {
    return NextResponse.json(
      { error: "You can't change your own role." },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role },
    });
    return NextResponse.json(publicUser(updated));
  } catch (error) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    console.error("PATCH /api/admin/users failed:", error);
    return NextResponse.json(
      { error: "Could not update the account." },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const guard = await adminApiGuard();
  if (guard.response) return guard.response;

  const { id } = await params;

  if (id === guard.user.id) {
    return NextResponse.json(
      { error: "You can't delete your own account." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    console.error("DELETE /api/admin/users failed:", error);
    return NextResponse.json(
      { error: "Could not delete the account." },
      { status: 500 },
    );
  }
}
