"use client";

// Live preview for image URL fields. Debounces the raw input so
// half-typed URLs don't flash broken-image states, and shows a
// clear placeholder / error / loading state at all times.
import { useEffect, useRef, useState } from "react";
import { IconImage } from "./icons.jsx";

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ImagePreview({ src, alt = "", label = "Preview" }) {
  const [debounced, setDebounced] = useState(src);
  const [state, setState] = useState("idle"); // idle | loading | ok | error
  const imgRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(src?.trim() ?? ""), 350);
    return () => clearTimeout(timer);
  }, [src]);

  const ready = isValidUrl(debounced);

  useEffect(() => {
    // The image can finish loading BEFORE this effect runs (cached /
    // hydrated markup) — onLoad may already have fired and would never
    // fire again, leaving a permanent spinner. Check the element itself.
    const img = imgRef.current;
    if (img?.complete) {
      setState(img.naturalWidth > 0 ? "ok" : "error");
      return;
    }
    setState(ready ? "loading" : "idle");
  }, [ready, debounced]);

  if (!ready) {
    return (
      <div className="flex aspect-[4/3] w-full max-w-80 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sand text-muted dark:border-white/15 dark:text-white/45">
        <IconImage className="h-6 w-6" />
        <p className="px-4 text-center text-xs font-medium">
          Paste an image URL to see a preview
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full max-w-80 overflow-hidden rounded-xl border border-sand bg-sand/40 dark:border-white/15 dark:bg-white/5">
      {state !== "ok" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted dark:text-white/50">
          {state === "error" ? (
            <>
              <IconImage className="h-6 w-6" />
              <p className="text-xs font-medium">Image could not be loaded</p>
            </>
          ) : (
            <div
              aria-hidden="true"
              className="h-6 w-6 animate-spin rounded-full border-2 border-sand border-t-pine dark:border-white/20 dark:border-t-emerald-300"
            />
          )}
        </div>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={debounced}
        alt={alt || label}
        onLoad={() => setState("ok")}
        onError={() => setState("error")}
        className={`h-full w-full object-cover transition-opacity duration-200 ${
          state === "ok" ? "opacity-100" : "opacity-0"
        }`}
      />
      {state === "ok" ? (
        <span className="absolute bottom-2 left-2 rounded-md bg-coal/75 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-white">
          {label}
        </span>
      ) : null}
    </div>
  );
}
