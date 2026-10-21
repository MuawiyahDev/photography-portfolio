// Edit one portfolio work. Loads it server-side by slug; 404s if missing.
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toPublicWork } from "@/lib/works.js";
import { getAllCategories } from "@/lib/categories.js";
import Badge from "@/components/ui/Badge.jsx";
import PageHeader from "@/components/admin/PageHeader.jsx";
import WorkForm from "@/components/admin/WorkForm.jsx";

export const dynamic = "force-dynamic";

export default async function AdminEditWorkPage({ params }) {
  const { slug } = await params;

  const [row, categories] = await Promise.all([
    prisma.work.findUnique({ where: { slug } }),
    getAllCategories(),
  ]);
  if (!row) notFound();

  const categoryLabel =
    categories.find((c) => c.slug === row.category)?.label ?? row.category;

  return (
    <div>
      <PageHeader
        title={`Edit “${row.title}”`}
        description="Changes appear on the public site immediately after saving."
        badge={<Badge tone="brand">{categoryLabel}</Badge>}
        actions={
          <Link
            href="/admin/works"
            className="text-sm font-semibold text-muted underline-offset-4 transition-colors hover:text-ink dark:text-white/60 dark:hover:text-white"
          >
            ← Back to works
          </Link>
        }
      />
      <WorkForm work={toPublicWork(row)} categories={categories} />
    </div>
  );
}
