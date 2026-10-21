// Shared access control for admin API routes and pages.
import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Returns the signed-in user only if they are an ADMIN,
 * otherwise null. Pages use this with redirect().
 */
export async function requireAdmin() {
  const session = await auth();
  if (session?.user && session.user.role === "ADMIN") {
    return session.user;
  }
  return null;
}

/**
 * For API routes. Returns { user } when the caller is an admin,
 * otherwise { response } — a ready-to-return JSON error with the
 * right status: 401 when there is no session, 403 when signed in
 * but not an admin.
 */
export async function adminApiGuard() {
  const session = await auth();
  if (!session?.user) {
    return {
      response: NextResponse.json(
        { error: "Sign in required." },
        { status: 401 },
      ),
    };
  }
  if (session.user.role !== "ADMIN") {
    return {
      response: NextResponse.json(
        { error: "Admin access required." },
        { status: 403 },
      ),
    };
  }
  return { user: session.user };
}
