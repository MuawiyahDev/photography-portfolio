/**
 * Site-wide layout container — single source of truth for
 * content width + horizontal gutters on every screen.
 *
 * Mobile-first padding (unprefixed → sm: → lg:, inherited by
 * md / xl / 2xl so no breakpoint is left unstyled):
 *   base (0–639px)    px-4  → 16px gutters, thumb-friendly
 *   sm   (640px+)     px-6  → 24px gutters
 *   lg   (1024px+)    px-8  → 32px gutters, holds through xl/2xl
 *
 * Width:
 *   default  max-w-7xl (80rem / 1280px), the Tailwind UI standard
 *   2xl      relaxes to 88rem so ultra-wide screens don't get
 *            stretched gutters (replaces the old 100rem query)
 *
 * @param {{ as?: string, size?: "default" | "narrow" | "wide", className?: string, children: React.ReactNode }} props
 */
const SIZES = {
  default: "max-w-7xl 2xl:max-w-[88rem]",
  narrow: "max-w-4xl",
  wide: "max-w-[88rem]",
};

export default function Container({
  as: Tag = "div",
  size = "default",
  className = "",
  children,
  ...rest
}) {
  return (
    <Tag
      className={`mx-auto w-full ${SIZES[size] ?? SIZES.default} px-4 sm:px-6 lg:px-8 ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
