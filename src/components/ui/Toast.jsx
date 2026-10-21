"use client";

// Toast notifications for success/failure confirmations.
// The provider lives inside the admin shell, so a toast survives
// client-side navigation (e.g. "Work created" shown on the list page).
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { IconAlert, IconCheck, IconClose, IconInfo } from "./icons.jsx";

const ToastContext = createContext(null);

const TONES = {
  success: {
    icon: IconCheck,
    className:
      "text-success ring-green-600/20 dark:text-emerald-300 dark:ring-emerald-300/25",
  },
  error: {
    icon: IconAlert,
    className:
      "text-error ring-red-600/20 dark:text-red-300 dark:ring-red-300/25",
  },
  info: {
    icon: IconInfo,
    className:
      "text-muted ring-sand dark:text-white/70 dark:ring-white/15",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    ({ tone = "success", title, message, duration = 5000 }) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((list) => [...list.slice(-2), { id, tone, title, message }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96"
      >
        {toasts.map((toast) => {
          const tone = TONES[toast.tone] ?? TONES.info;
          const ToneIcon = tone.icon;
          return (
            <div
              key={toast.id}
              role={toast.tone === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl bg-white p-4 shadow-lg ring-1 animate-[toast-in_0.18s_ease-out] dark:bg-[#262019] ${tone.className}`}
            >
              <span aria-hidden="true" className="mt-0.5 shrink-0">
                <ToneIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink dark:text-cream">
                  {toast.title}
                </p>
                {toast.message ? (
                  <p className="mt-0.5 text-sm text-muted dark:text-white/60">
                    {toast.message}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded-md p-1 text-ink/40 transition-colors hover:bg-sand/70 hover:text-ink dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return context;
}
