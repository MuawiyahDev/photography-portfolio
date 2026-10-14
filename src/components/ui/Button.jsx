const VARIANTS = {
  primary: "bg-pine text-white hover:bg-pine-dark",
  ghost: "border border-ink/30 text-ink bg-transparent",
  dark: "bg-coal text-white border border-coal hover:bg-pine hover:border-pine",
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
    "border border-transparent cursor-pointer no-underline transition-colors duration-200",
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
