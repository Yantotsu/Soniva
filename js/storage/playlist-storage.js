
const STORAGE_KEY = "soniva:playlists";

function readPlaylists() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function savePlaylists(playlists) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
}

export function getPlaylists() {
  return readPlaylists();
}

export function createPlaylist(name, description = "") {
  const cleanName = String(name || "").trim();

  if (!cleanName) {
    throw new Error("Nama playlist tidak boleh kosong.");
  }

  const playlists = readPlaylists();

  const playlist = {
    id: `playlist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: cleanName,
    description: String(description || "").trim(),
    tracks: [],
    createdAt: new Date().toISOString()
  };

  playlists.unshift(playlist);
  savePlaylists(playlists);

  return playlist;
}

export function deletePlaylist(playlistId) {
  const updated = readPlaylists().filter(
    (playlist) => playlist.id !== playlistId
  );

  savePlaylists(updated);
  return updated;
}

export function addTrackToPlaylist(playlistId, track) {
  if (!track?.id) {
    throw new Error("Lagu harus memiliki ID.");
  }

  const playlists = readPlaylists();
  const playlist = playlists.find((item) => item.id === playlistId);

  if (!playlist) {
    throw new Error("Playlist tidak ditemukan.");
  }

  const exists = playlist.tracks.some((item) => item.id === track.id);

  if (!exists) {
    playlist.tracks.push(track);
  }

  savePlaylists(playlists);
  return playlist;
}

export function removeTrackFromPlaylist(playlistId, trackId) {
  const playlists = readPlaylists();
  const playlist = playlists.find((item) => item.id === playlistId);

  if (!playlist) {
    throw new Error("Playlist tidak ditemukan.");
  }

  playlist.tracks = playlist.tracks.filter((track) => track.id !== trackId);

  savePlaylists(playlists);
  return playlist;
}
