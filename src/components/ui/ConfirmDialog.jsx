"use client";

// Modal confirmation for destructive actions.
// Escape/backdrop cancel, initial focus lands on Cancel (safe default),
// and the confirm button shows a busy state while working.
import { useEffect, useRef } from "react";
import { IconAlert } from "./icons.jsx";
import Button from "./Button.jsx";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape" && !busy) onCancel();
      // Minimal focus containment: Tab cycles within the dialog.
      if (event.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        onClick={busy ? undefined : onCancel}
        className="absolute inset-0 cursor-default bg-coal/60 backdrop-blur-[2px]"
      />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="relative w-full max-w-md animate-[dialog-in_0.18s_ease-out] rounded-2xl bg-white p-6 text-ink shadow-2xl ring-1 ring-black/10 dark:bg-[#262019] dark:text-cream dark:ring-white/10"
      >
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-error ring-1 ring-red-600/15 dark:bg-red-400/10 dark:ring-red-300/20"
          >
            <IconAlert className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2
              id="confirm-dialog-title"
              className="font-display text-xl font-medium"
            >
              {title}
            </h2>
            <p
              id="confirm-dialog-message"
              className="mt-1.5 text-sm text-muted dark:text-white/60"
            >
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" ref={cancelRef} onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} busy={busy}>
            {busy ? undefined : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
