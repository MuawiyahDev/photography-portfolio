"use client";

// Works management table: search filter, row action menu (edit/delete),
// confirmed deletion with a toast, and purposeful empty states.
// `categories` is the DB-managed tab list (used for labels in rows,
// badges, and search).
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiSend } from "@/lib/api.js";
import { formatDate } from "@/lib/format.js";
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
  IconFolderPlus,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@/components/ui/icons.jsx";

export default function WorkTable({ works, categories = [] }) {
  const router = useRouter();
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const labelFor = useMemo(() => {
    const labels = Object.fromEntries(
      categories.map((c) => [c.slug, c.label]),
    );
    return (slug) => labels[slug] ?? slug;
  }, [categories]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return works;
    return works.filter((work) =>
      [work.title, work.id, labelFor(work.category)]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [works, query, labelFor]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);

    const result = await apiSend(`/api/admin/works/${pendingDelete.id}`, {
      method: "DELETE",
    });

    setDeleting(false);

    if (!result.ok) {
      push({
        tone: "error",
        title: "Could not delete the work",
        message: result.data?.error ?? "Please try again.",
      });
      setPendingDelete(null);
      return;
    }

    setPendingDelete(null);
    push({
      tone: "success",
      title: "Work deleted",
      message: `“${pendingDelete.title}” was removed from the gallery.`,
    });
    router.refresh();
  };

  // No works at all → invite creation.
  if (works.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<IconFolderPlus className="h-6 w-6" />}
          title="No works yet"
          description="Add your first photograph or series — it will appear in the public gallery immediately after saving."
          action={
            <Button href="/admin/works/new">
              <IconPlus className="h-4 w-4" />
              New work
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <IconSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40 dark:text-white/40"
          />
          <label htmlFor="works-search" className="sr-only">
            Search works
          </label>
          <input
            id="works-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, slug, category…"
            className="w-full rounded-full border border-sand bg-white py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 hover:border-ink/25 focus:border-pine focus:ring-2 focus:ring-pine/25 dark:border-white/15 dark:bg-white/5 dark:text-cream dark:placeholder:text-white/35 dark:hover:border-white/25 dark:focus:border-emerald-300 dark:focus:ring-emerald-300/20"
          />
        </div>
        <p
          aria-live="polite"
          className="text-sm text-muted dark:text-white/55"
        >
          {query.trim()
            ? `${filtered.length} of ${works.length} works`
            : `${works.length} work${works.length === 1 ? "" : "s"}`}
        </p>
        <Button href="/admin/works/new" size="sm" className="sm:ml-auto">
          <IconPlus className="h-4 w-4" />
          New work
        </Button>
      </div>

      {/* No search results */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<IconSearch className="h-6 w-6" />}
            title="No matching works"
            description={`Nothing matches “${query.trim()}”. Try a different title, slug, or category.`}
            action={
              <Button variant="secondary" size="sm" onClick={() => setQuery("")}>
                Clear search
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sand/70 text-xs font-bold uppercase tracking-wider text-muted dark:border-white/10 dark:text-white/55">
                  <th scope="col" className="px-5 py-3.5">
                    Work
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Span
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Updated
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/70 dark:divide-white/10">
                {filtered.map((work) => (
                  <tr
                    key={work.id}
                    className="group transition-colors hover:bg-cream/70 dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/10 dark:ring-white/15">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={work.src}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink dark:text-cream">
                            {work.title}
                          </p>
                          <p className="truncate font-mono text-xs text-muted dark:text-white/45">
                            {work.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone="brand">{labelFor(work.category)}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      {work.span ? (
                        <Badge tone="neutral">{work.span}</Badge>
                      ) : (
                        <span className="text-muted dark:text-white/40">
                          —
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-muted dark:text-white/60">
                      {work.updatedAt ? formatDate(work.updatedAt) : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end">
                        <DropdownMenu
                          label={`Actions for ${work.title}`}
                          trigger={
                            <button
                              type="button"
                              aria-label={`Actions for ${work.title}`}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand/70 hover:text-ink focus-visible:outline-3 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                            >
                              <IconDots className="h-5 w-5" />
                            </button>
                          }
                          items={[
                            {
                              label: "Edit",
                              href: `/admin/works/${work.id}`,
                              icon: <IconEdit className="h-4 w-4" />,
                            },
                            {
                              label: "Delete",
                              icon: <IconTrash className="h-4 w-4" />,
                              danger: true,
                              onSelect: () => setPendingDelete(work),
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
            {filtered.map((work) => (
              <li key={work.id}>
                <Card className="flex items-center gap-3.5 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={work.src}
                    alt=""
                    loading="lazy"
                    className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-black/10 dark:ring-white/15"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink dark:text-cream">
                      {work.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge tone="brand">{labelFor(work.category)}</Badge>
                      <span className="truncate font-mono text-xs text-muted dark:text-white/45">
                        {work.id}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu
                    label={`Actions for ${work.title}`}
                    trigger={
                      <button
                        type="button"
                        aria-label={`Actions for ${work.title}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand/70 hover:text-ink dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        <IconDots className="h-5 w-5" />
                      </button>
                    }
                    items={[
                      {
                        label: "Edit",
                        href: `/admin/works/${work.id}`,
                        icon: <IconEdit className="h-4 w-4" />,
                      },
                      {
                        label: "Delete",
                        icon: <IconTrash className="h-4 w-4" />,
                        danger: true,
                        onSelect: () => setPendingDelete(work),
                      },
                    ]}
                  />
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this work?"
        message={`“${pendingDelete?.title}” will be permanently removed from the gallery and from every user's favorites. This cannot be undone.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
