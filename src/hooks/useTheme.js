import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "bilal-ahmed-portfolio:theme:v1";

function initialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage unavailable — fall through to system preference.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Site theme ("light" | "dark"), persisted to localStorage and applied
 * as a `.dark` class on <html> for Tailwind's class-based dark mode.
 * Defaults to the OS preference on first visit.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage unavailable — theme applies for this session only.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
}
