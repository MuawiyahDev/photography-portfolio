// Works list — every gallery work with search and row actions.
import { prisma } from "@/lib/prisma.js";
import { toPublicWork } from "@/lib/works.js";
import { getAllCategories } from "@/lib/categories.js";
import Badge from "@/components/ui/Badge.jsx";
import PageHeader from "@/components/admin/PageHeader.jsx";
import WorkTable from "@/components/admin/WorkTable.jsx";

export const dynamic = "force-dynamic";

export default async function AdminWorksPage() {
  const [rows, categories] = await Promise.all([
    prisma.work.findMany({ orderBy: { createdAt: "asc" } }),
    getAllCategories(),
  ]);
  const works = rows.map((row) => ({
    ...toPublicWork(row),
    updatedAt: row.updatedAt,
  }));

  return (
    <div>
      <PageHeader
        title="Portfolio"
        description="Create and manage the works shown in the public gallery."
        badge={
          <Badge tone="brand">
            {works.length} work{works.length === 1 ? "" : "s"}
          </Badge>
        }
      />
      <WorkTable works={works} categories={categories} />
    </div>
  );
}

