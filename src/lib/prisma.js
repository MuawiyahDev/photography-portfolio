import { PrismaClient } from "@prisma/client";

// Reuse one PrismaClient across hot reloads in development.
// Creating a new client per request can exhaust database connections.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
