import { useEffect, useState } from "react";

/**
 * useState persisted to localStorage — survives refresh.
 * Falls back to in-memory state when storage is unavailable.
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) return JSON.parse(raw);
    } catch {
      // Storage unavailable (e.g. private mode) — use the default.
    }
    return typeof initialValue === "function" ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable — value stays in memory for this session.
    }
  }, [key, value]);

  return [value, setValue];
}
