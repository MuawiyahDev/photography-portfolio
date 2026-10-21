// POST /api/auth/register — create a new account.
//
// Flow: validate input with Zod → reject duplicate emails (409) →
// hash the password with bcrypt (cost 10) → save the User row →
// return the safe public fields (never the hash).
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma.js";
import { registerSchema, fieldErrors } from "@/lib/validation.js";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", fields: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  // Reject duplicates. (A unique constraint in the schema is the real
  // guarantee; this check just returns a friendlier 409.)
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "USER" },
  });

  // Never send the password hash to the client.
  return NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email } },
    { status: 201 },
  );
}
