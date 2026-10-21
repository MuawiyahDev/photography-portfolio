"use client";

// Category management table: row action menu (edit/delete), confirmed
// deletion with a toast, work-count badges, and empty states.
// Deleting a category that still has works is blocked by the API (409)
// and reported in a toast.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiSend } from "@/lib/api.js";
import Button from "@/components/ui/Button.jsx";
import Badge from "@/components/ui/Badge.jsx";
import Card from "@/components/ui/Card.jsx";
import ConfirmDialog from "@/components/ui/ConfirmDialog.jsx";
import DropdownMenu from "@/components/ui/DropdownMenu.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import {
  IconDots,
  IconEdit,
  IconPlus,
  IconTag,
  IconTrash,
} from "@/components/ui/icons.jsx";

export default function CategoryTable({ categories, onEdit }) {
  const router = useRouter();
  const { push } = useToast();
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sorted = useMemo(
    () =>
      [...categories].sort(
        (a, b) => a.order - b.order || a.label.localeCompare(b.label),
      ),
    [categories],
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);

    const result = await apiSend(
      `/api/admin/categories/${pendingDelete.id}`,
      { method: "DELETE" },
    );

    setDeleting(false);

    if (!result.ok) {
      push({
        tone: "error",
        title: "Could not delete the category",
        message: result.data?.error ?? "Please try again.",
      });
      setPendingDelete(null);
      return;
    }

    setPendingDelete(null);
    push({
      tone: "success",
      title: "Category deleted",
      message: `“${pendingDelete.label}” was removed.`,
    });
    router.refresh();
  };

  if (sorted.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<IconTag className="h-6 w-6" />}
          title="No categories yet"
          description="Create the first category above — it becomes a filter tab in the public gallery immediately."
          action={
            <Button href="#category-form">
              <IconPlus className="h-4 w-4" />
              Create category
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Desktop table */}
      <Card className="hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sand/70 text-xs font-bold uppercase tracking-wider text-muted dark:border-white/10 dark:text-white/55">
              <th scope="col" className="px-5 py-3.5">
                Category
              </th>
              <th scope="col" className="px-4 py-3.5">
                Slug
              </th>
              <th scope="col" className="px-4 py-3.5">
                Order
              </th>
              <th scope="col" className="px-4 py-3.5">
                Works
              </th>
              <th scope="col" className="px-4 py-3.5 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/70 dark:divide-white/10">
            {sorted.map((category) => (
              <tr
                key={category.id}
                className="group transition-colors hover:bg-cream/70 dark:hover:bg-white/[0.03]"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pine/10 text-pine ring-1 ring-pine/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/20"
                    >
                      <IconTag className="h-4 w-4" />
                    </span>
                    <span className="font-semibold text-ink dark:text-cream">
                      {category.label}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-muted dark:text-white/45">
                  {category.slug}
                </td>
                <td className="px-4 py-3.5 text-muted dark:text-white/60">
                  {category.order}
                </td>
                <td className="px-4 py-3.5">
                  <Badge tone={category.workCount > 0 ? "brand" : "neutral"}>
                    {category.workCount} work
                    {category.workCount === 1 ? "" : "s"}
                  </Badge>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex justify-end">
                    <DropdownMenu
                      label={`Actions for ${category.label}`}
                      trigger={
                        <button
                          type="button"
                          aria-label={`Actions for ${category.label}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand/70 hover:text-ink focus-visible:outline-3 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <IconDots className="h-5 w-5" />
                        </button>
                      }
                      items={[
                        {
                          label: "Edit",
                          icon: <IconEdit className="h-4 w-4" />,
                          onSelect: () => onEdit?.(category),
                        },
                        {
                          label: "Delete",
                          icon: <IconTrash className="h-4 w-4" />,
                          danger: true,
                          onSelect: () => setPendingDelete(category),
                        },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Mobile cards */}
      <ul className="grid gap-3 md:hidden">
        {sorted.map((category) => (
          <li key={category.id}>
            <Card className="flex items-center gap-3.5 p-4">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pine/10 text-pine ring-1 ring-pine/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/20"
              >
                <IconTag className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink dark:text-cream">
                  {category.label}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted dark:text-white/45">
                    {category.slug}
                  </span>
                  <Badge tone={category.workCount > 0 ? "brand" : "neutral"}>
                    {category.workCount} work
                    {category.workCount === 1 ? "" : "s"}
                  </Badge>
                </div>
              </div>
              <DropdownMenu
                label={`Actions for ${category.label}`}
                trigger={
                  <button
                    type="button"
                    aria-label={`Actions for ${category.label}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand/70 hover:text-ink dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <IconDots className="h-5 w-5" />
                  </button>
                }
                items={[
                  {
                    label: "Edit",
                    icon: <IconEdit className="h-4 w-4" />,
                    onSelect: () => onEdit?.(category),
                  },
                  {
                    label: "Delete",
                    icon: <IconTrash className="h-4 w-4" />,
                    danger: true,
                    onSelect: () => setPendingDelete(category),
                  },
                ]}
              />
            </Card>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this category?"
        message={`“${pendingDelete?.label}” will be removed as a gallery tab. Categories used by works cannot be deleted — reassign those works first.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
