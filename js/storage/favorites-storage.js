
const STORAGE_KEY = "soniva:favorites";

function readFavorites() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function getFavorites() {
  return readFavorites();
}

export function isFavorite(trackId) {
  return readFavorites().some((track) => track.id === trackId);
}

export function toggleFavorite(track) {
  if (!track?.id) {
    throw new Error("Lagu harus memiliki ID.");
  }

  const favorites = readFavorites();
  const exists = favorites.some((item) => item.id === track.id);

  const updated = exists
    ? favorites.filter((item) => item.id !== track.id)
    : [...favorites, track];

  saveFavorites(updated);

  return {
    isFavorite: !exists,
    favorites: updated
  };
}

export function removeFavorite(trackId) {
  const updated = readFavorites().filter((track) => track.id !== trackId);
  saveFavorites(updated);
  return updated;
}
