// Categories — the DB-backed filter tabs of the public gallery.
// Work counts are aggregated from the Work table (works reference
// categories by slug, so there is no relation to count).
import { prisma } from "@/lib/prisma.js";
import { getAllCategories } from "@/lib/categories.js";
import Badge from "@/components/ui/Badge.jsx";
import PageHeader from "@/components/admin/PageHeader.jsx";
import CategoryManager from "@/components/admin/CategoryManager.jsx";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, counts] = await Promise.all([
    getAllCategories(),
    prisma.work.groupBy({ by: ["category"], _count: { _all: true } }),
  ]);

  const countMap = Object.fromEntries(
    counts.map((entry) => [entry.category, entry._count._all]),
  );
  const rows = categories.map((category) => ({
    ...category,
    workCount: countMap[category.slug] ?? 0,
  }));

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Filter tabs for the public gallery. Create, rename, reorder, or remove them — the site picks them up immediately."
        badge={
          <Badge tone="brand">
            {rows.length} categor{rows.length === 1 ? "y" : "ies"}
          </Badge>
        }
      />
      <CategoryManager categories={rows} />
    </div>
  );
}
