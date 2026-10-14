export default function Eyebrow({ children, tone = "light", className = "" }) {
  const color = tone === "dark" ? "text-clay" : "text-pine";
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-[0.14em] mb-3 ${color} ${className}`}
    >
      {children}
    </p>
  );
}
