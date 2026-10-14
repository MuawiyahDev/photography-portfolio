const VARIANTS = {
  primary: "border-pine bg-pine text-white hover:bg-pine-dark hover:border-pine-dark",
  ghost:
    "border-sand bg-transparent text-ink hover:border-ink dark:border-white/20 dark:text-cream dark:hover:border-white",
  dark: "bg-coal text-white border border-coal hover:bg-pine hover:border-pine dark:bg-cream dark:text-coal dark:border-cream dark:hover:bg-white dark:hover:border-white",
  small: "",
};

export default function Button({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  const sizeClass =
    size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3 text-[0.95rem]";
  const classes = [
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full",
    "border cursor-pointer no-underline transition-colors duration-200",
    VARIANTS[variant] ?? VARIANTS.primary,
    sizeClass,
    className,
  ].join(" ");

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
