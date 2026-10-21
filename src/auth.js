// Auth.js (NextAuth v5) configuration.
//
// How it works, in plain English:
// 1. The Credentials provider takes the email/password from the login
//    form, looks the user up in PostgreSQL via Prisma, and compares the
//    password against the bcrypt hash stored in `User.passwordHash`.
//    Returning `null` fails the login — we never say WHICH thing was
//    wrong, so attackers can't probe which emails have accounts.
// 2. On success, Auth.js creates a signed, HTTP-only session cookie.
//    We use the "jwt" strategy: the cookie holds a small signed token
//    (not a server-side session row), which survives page refreshes and
//    works across serverless functions on Vercel.
// 3. The `jwt`/`session` callbacks copy the user's id and role into the
//    session object, so API routes can do `session.user.role === "ADMIN"`.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma.js";
import { loginSchema } from "./lib/validation.js";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate shape first — never trust raw form input.
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Returned object becomes the `user` argument in the jwt callback.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // On sign-in, `user` is the object returned by authorize() above.
    // Stash id + role inside the JWT so every later request can use them.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Copy JWT contents onto the session object that `auth()` returns.
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
});
