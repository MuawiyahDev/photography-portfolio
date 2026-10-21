"use client";

// Password input with a show/hide eye toggle. The toggle is a real
// button of type="button" (never submits the form), labelled for
// screen readers, and the input keeps extra right padding so text
// never runs under the icon.
import { useState } from "react";
import { IconEye, IconEyeOff } from "./icons.jsx";

export default function PasswordInput({ className = "", ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={`${className} pr-12`}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        tabIndex={0}
        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink/45 transition-colors hover:text-ink focus-visible:outline-3 dark:text-white/45 dark:hover:text-white"
      >
        {visible ? (
          <IconEyeOff className="h-[1.05rem] w-[1.05rem]" />
        ) : (
          <IconEye className="h-[1.05rem] w-[1.05rem]" />
        )}
      </button>
    </div>
  );
}
