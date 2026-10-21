// Auth.js route handler — catches every request under /api/auth/*
// (session lookup, sign-in, sign-out, CSRF protection, etc.).
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
