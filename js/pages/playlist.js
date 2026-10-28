
import {
  getPlaylists,
  removeTrackFromPlaylist
} from "../storage/playlist-storage.js";
import { createSongCard } from "../components/song-card.js";
import { showToast } from "../components/toast.js";

export async function renderPlaylist(container) {
  const playlistId = sessionStorage.getItem("soniva:active-playlist");
  const playlist = getPlaylists().find((item) => item.id === playlistId);

  const page = document.createElement("section");
  page.className = "playlist-page";

  if (!playlist) {
    const title = document.createElement("h1");
    title.textContent = "Playlist tidak ditemukan";

    const back = document.createElement("button");
    back.type = "button";
    back.className = "secondary-button";
    back.textContent = "Kembali ke Library";
    back.addEventListener("click", () => {
      window.location.hash = "library";
    });

    page.append(title, back);
    container.replaceChildren(page);
    return;
  }

  const header = document.createElement("header");
  header.className = "playlist-hero";

  const icon = document.createElement("div");
  icon.className = "playlist-hero-icon";
  icon.textContent = "♫";

  const info = document.createElement("div");

  const eyebrow = document.createElement("p");
  eyebrow.textContent = "PLAYLIST";

  const title = document.createElement("h1");
  title.textContent = playlist.name;

  const description = document.createElement("p");
  description.textContent =
    playlist.description || `${playlist.tracks.length} lagu`;

  info.append(eyebrow, title, description);
  header.append(icon, info);

  const list = document.createElement("div");
  list.className = "playlist-track-list";

  if (!playlist.tracks.length) {
    const empty = document.createElement("p");
    empty.className = "playlist-empty";
    empty.textContent = "Playlist ini belum memiliki lagu.";
    list.append(empty);
  }

  playlist.tracks.forEach((track) => {
    const card = createSongCard(track);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "secondary-button";
    removeButton.textContent = "Hapus dari playlist";

    removeButton.addEventListener("click", () => {
      removeTrackFromPlaylist(playlist.id, track.id);
      showToast("Lagu dihapus dari playlist.", "success");
      renderPlaylist(container);
    });

    card.append(removeButton);
    list.append(card);
  });

  page.append(header, list);
  container.replaceChildren(page);
}
