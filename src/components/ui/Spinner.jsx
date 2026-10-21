import { IconLoader } from "./icons.jsx";

export default function Spinner({
  label = "Loading",
  className = "h-5 w-5",
}) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <IconLoader className={`text-current ${className}`} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
