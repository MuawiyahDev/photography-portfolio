import { IconAlert, IconCheck } from "./icons.jsx";

// Inline form-level status banner (validation failures from the server).
// Success confirmations use the toast system instead — see ui/Toast.jsx.
export default function FormStatus({ status }) {
  if (!status?.message) return null;

  const isError = status.type === "error";

  return (
    <p
      role={isError ? "alert" : "status"}
      aria-live="polite"
      className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ring-1 ${
        isError
          ? "bg-red-50 text-error ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-300/20"
          : "bg-green-50 text-success ring-green-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/20"
      }`}
    >
      <span aria-hidden="true" className="mt-0.5 shrink-0">
        {isError ? (
          <IconAlert className="h-4 w-4" />
        ) : (
          <IconCheck className="h-4 w-4" />
        )}
      </span>
      <span>{status.message}</span>
    </p>
  );
}
