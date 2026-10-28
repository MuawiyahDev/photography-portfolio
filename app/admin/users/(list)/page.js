// Users — every registered account with role management.
// Never returns password hashes (explicit select).
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma.js";
import Badge from "@/components/ui/Badge.jsx";
import PageHeader from "@/components/admin/PageHeader.jsx";
import UserTable from "@/components/admin/UserTable.jsx";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();

  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { favorites: true } },
    },
  });

  const users = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt,
    favoriteCount: row._count.favorites,
  }));

  const adminCount = users.filter((user) => user.role === "ADMIN").length;

  return (
    <div>
      <PageHeader
        title="Users"
        description="Registered accounts and their roles. Administrators can manage the dashboard; members can save favorites and submit inquiries."
        badge={
          <Badge tone="brand">
            {users.length} account{users.length === 1 ? "" : "s"} ·{" "}
            {adminCount} admin{adminCount === 1 ? "" : "s"}
          </Badge>
        }
      />
      <UserTable users={users} currentUserId={session?.user?.id} />
    </div>
  );
}
