"use client";

// Registered accounts: role badges, promote/demote, and confirmed
// deletion. Your own row is locked (no actions) so the dashboard can
// never lock itself out.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiSend } from "@/lib/api.js";
import { formatDate } from "@/lib/format.js";
import Badge from "@/components/ui/Badge.jsx";
import Card from "@/components/ui/Card.jsx";
import ConfirmDialog from "@/components/ui/ConfirmDialog.jsx";
import DropdownMenu from "@/components/ui/DropdownMenu.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { IconDots, IconEye, IconShield, IconTrash, IconUsers } from "@/components/ui/icons.jsx";

function initials(name, email) {
  const source = (name ?? email ?? "?").trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function UserTable({ users, currentUserId }) {
  const router = useRouter();
  const { push } = useToast();
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const toggleRole = async (user) => {
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    setTogglingId(user.id);

    const result = await apiSend(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: { role: nextRole },
    });

    setTogglingId(null);

    if (!result.ok) {
      push({
        tone: "error",
        title: "Could not change the role",
        message: result.data?.error ?? "Please try again.",
      });
      return;
    }

    push({
      tone: "success",
      title: nextRole === "ADMIN" ? "Admin access granted" : "Role changed",
      message: `${user.email} is now ${nextRole === "ADMIN" ? "an administrator" : "a member"}. They must sign in again for the change to take effect.`,
    });
    router.refresh();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);

    const result = await apiSend(`/api/admin/users/${pendingDelete.id}`, {
      method: "DELETE",
    });

    setDeleting(false);

    if (!result.ok) {
      push({
        tone: "error",
        title: "Could not delete the account",
        message: result.data?.error ?? "Please try again.",
      });
      setPendingDelete(null);
      return;
    }

    setPendingDelete(null);
    push({
      tone: "success",
      title: "Account deleted",
      message: `${pendingDelete.email} and their favorites were removed.`,
    });
    router.refresh();
  };

  return (
    <div className="grid gap-4">
      {/* Desktop table */}
      <Card className="hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sand/70 text-xs font-bold uppercase tracking-wider text-muted dark:border-white/10 dark:text-white/55">
              <th scope="col" className="px-5 py-3.5">
                Account
              </th>
              <th scope="col" className="px-4 py-3.5">
                Role
              </th>
              <th scope="col" className="px-4 py-3.5">
                Joined
              </th>
              <th scope="col" className="px-4 py-3.5">
                Favorites
              </th>
              <th scope="col" className="px-4 py-3.5 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/70 dark:divide-white/10">
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr
                  key={user.id}
                  className="group transition-colors hover:bg-cream/70 dark:hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine/10 text-[0.7rem] font-bold text-pine ring-1 ring-pine/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/20"
                      >
                        {initials(user.name, user.email)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink dark:text-cream">
                          {user.name ?? "—"}
                          {isSelf ? (
                            <span className="ml-2 font-normal text-muted dark:text-white/45">
                              (you)
                            </span>
                          ) : null}
                        </p>
                        <p className="truncate text-xs text-muted dark:text-white/45">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={user.role === "ADMIN" ? "brand" : "neutral"}>
                      {user.role === "ADMIN" ? "Administrator" : "Member"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-muted dark:text-white/60">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 text-muted dark:text-white/60">
                    {user.favoriteCount}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end">
                      {isSelf ? (
                        <span className="text-xs text-muted dark:text-white/40">
                          —
                        </span>
                      ) : (
                        <DropdownMenu
                          label={`Actions for ${user.email}`}
                          trigger={
                            <button
                              type="button"
                              aria-label={`Actions for ${user.email}`}
                              disabled={togglingId === user.id}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand/70 hover:text-ink focus-visible:outline-3 disabled:cursor-progress dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                            >
                              <IconDots className="h-5 w-5" />
                            </button>
                          }
                          items={[
                            {
                              label: "View details",
                              href: `/admin/users/${user.id}`,
                              icon: <IconEye className="h-4 w-4" />,
                            },
                            {
                              label:
                                user.role === "ADMIN"
                                  ? "Remove admin"
                                  : "Make admin",
                              icon: <IconShield className="h-4 w-4" />,
                              onSelect: () => toggleRole(user),
                            },
                            {
                              label: "Delete",
                              icon: <IconTrash className="h-4 w-4" />,
                              danger: true,
                              onSelect: () => setPendingDelete(user),
                            },
                          ]}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Mobile cards */}
      <ul className="grid gap-3 md:hidden">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          return (
            <li key={user.id}>
              <Card className="flex items-start gap-3.5 p-4">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pine/10 text-xs font-bold text-pine ring-1 ring-pine/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/20"
                >
                  {initials(user.name, user.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink dark:text-cream">
                    {user.name ?? "—"}
                    {isSelf ? (
                      <span className="ml-2 font-normal text-muted dark:text-white/45">
                        (you)
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted dark:text-white/45">
                    {user.email}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={user.role === "ADMIN" ? "brand" : "neutral"}>
                      {user.role === "ADMIN" ? "Administrator" : "Member"}
                    </Badge>
                    <span className="text-xs text-muted dark:text-white/50">
                      {user.favoriteCount} favorites · joined{" "}
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
                {!isSelf ? (
                  <DropdownMenu
                    label={`Actions for ${user.email}`}
                    trigger={
                      <button
                        type="button"
                        aria-label={`Actions for ${user.email}`}
                        disabled={togglingId === user.id}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand/70 hover:text-ink dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        <IconDots className="h-5 w-5" />
                      </button>
                    }
                    items={[
                      {
                        label: "View details",
                        href: `/admin/users/${user.id}`,
                        icon: <IconEye className="h-4 w-4" />,
                      },
                      {
                        label:
                          user.role === "ADMIN"
                            ? "Remove admin"
                            : "Make admin",
                        icon: <IconShield className="h-4 w-4" />,
                        onSelect: () => toggleRole(user),
                      },
                      {
                        label: "Delete",
                        icon: <IconTrash className="h-4 w-4" />,
                        danger: true,
                        onSelect: () => setPendingDelete(user),
                      },
                    ]}
                  />
                ) : null}
              </Card>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this account?"
        message={`${pendingDelete?.email} will lose access immediately and all of their favorites will be removed. This cannot be undone.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
