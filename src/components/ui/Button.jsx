import Link from "next/link";
import { IconLoader } from "./icons.jsx";

const VARIANTS = {
  primary:
    "border-pine bg-pine text-white hover:bg-pine-dark hover:border-pine-dark active:bg-pine-dark",
  secondary:
    "border-sand bg-white text-muted hover:border-ink hover:text-ink dark:border-white/15 dark:bg-white/5 dark:text-white/75 dark:hover:border-white/40 dark:hover:text-white",
  ghost:
    "border-sand bg-transparent text-muted hover:border-ink hover:text-ink dark:border-white/20 dark:text-white/65 dark:hover:border-white dark:hover:text-white",
  danger:
    "border-error bg-error text-white hover:bg-[#8f1e17] hover:border-[#8f1e17] active:bg-[#7a1913]",
  dark: "bg-coal text-white border border-coal hover:bg-pine hover:border-pine dark:bg-cream dark:text-coal dark:border-cream dark:hover:bg-white dark:hover:border-white",
};

// Sizes match the original React build exactly (public site + dashboard).
const SIZES = {
  sm: "px-4 py-2 text-sm gap-2",
  md: "px-6 py-3 text-[0.95rem] gap-2",
};

/**
 * Shared button (site + dashboard).
 * - `href` starting with "/" renders a client <Link>, anything else an <a>
 * - `busy` shows a spinner and blocks double submits
 * - `variant`: primary | secondary | ghost | danger | dark
 * - `size`: sm | md | lg
 */
export default function Button({
  href,
  variant = "primary",
  size = "md",
  type = "button",
  busy = false,
  disabled = false,
  className = "",
  children,
  ...rest
}) {
  const classes = [
    "inline-flex items-center justify-center rounded-full font-semibold",
    "border cursor-pointer no-underline select-none",
    "transition-colors duration-150",
    "disabled:pointer-events-none disabled:opacity-55",
    "focus-visible:outline-3", // ensure ring even on dark surfaces
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    className,
  ].join(" ");

  const content = busy ? (
    <>
      <IconLoader className="h-4 w-4 shrink-0" />
      <span>Working…</span>
    </>
  ) : (
    children
  );

  if (href) {
    const isInternal = href.startsWith("/");
    if (isInternal) {
      return (
        <Link
          href={href}
          className={classes}
          aria-disabled={disabled || busy ? "true" : undefined}
          {...rest}
        >
          {content}
        </Link>
      );
    }
    return (
      <a
        href={href}
        className={classes}
        aria-disabled={disabled || busy ? "true" : undefined}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
