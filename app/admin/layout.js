// Admin area layout — the access-control gate for ALL dashboard pages.
// requireAdmin() verifies the session cookie on the server; visitors
// are redirected to login (or home, if signed in but not an admin).
// The API routes check the same rule independently, so hiding UI is
// never the only protection.
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma.js";
import AdminShell from "@/components/admin/AdminShell.jsx";

export default async function AdminLayout({ children }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  // Badge counts shared with the sidebar (one cheap count per render).
  const [inquiryCount, workCount, userCount] = await Promise.all([
    prisma.inquiry.count(),
    prisma.work.count(),
    prisma.user.count(),
  ]);

  return (
    <AdminShell
      user={{ name: admin.name, email: admin.email, role: admin.role }}
      badges={{ inquiries: inquiryCount, works: workCount, users: userCount }}
    >
      {children}
    </AdminShell>
  );
}
