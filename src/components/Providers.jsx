"use client";

// Wraps the app in Auth.js's SessionProvider so any client component
// can read the signed-in user with useSession().
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
