import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "bilal-ahmed-portfolio:favorites:v1";

function readStoredFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === "string");
  } catch {
    // Storage unavailable (e.g. private mode) — start empty.
    return [];
  }
}

/**
 * Liked-work ids persisted to localStorage, so favorites survive refresh.
 * Syncs across open tabs via the `storage` event.
 */
export default function useFavorites() {
  const [favorites, setFavorites] = useState(readStoredFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Storage unavailable — favorites stay in memory for this session.
    }
  }, [favorites]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) setFavorites(readStoredFavorites());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  }, []);

  const isFavorite = useCallback(
    (id) => favorites.includes(id),
    [favorites],
  );

  return { favorites, favoriteCount: favorites.length, toggleFavorite, isFavorite };
}
