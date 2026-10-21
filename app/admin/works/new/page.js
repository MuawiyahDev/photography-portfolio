// Create a new portfolio work. Categories (tabs) come from the DB.
import Link from "next/link";
import { getAllCategories } from "@/lib/categories.js";
import PageHeader from "@/components/admin/PageHeader.jsx";
import WorkForm from "@/components/admin/WorkForm.jsx";

export const dynamic = "force-dynamic";

export default async function AdminNewWorkPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <PageHeader
        title="New work"
        description="Add one photograph or series to the public gallery. It appears immediately after saving."
        actions={
          <Link
            href="/admin/works"
            className="text-sm font-semibold text-muted underline-offset-4 transition-colors hover:text-ink dark:text-white/60 dark:hover:text-white"
          >
            ← Back to works
          </Link>
        }
      />
      <WorkForm work={null} categories={categories} />
    </div>
  );
}
