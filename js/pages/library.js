
import { getFavorites, removeFavorite } from "../storage/favorites-storage.js";
import {
  getPlaylists,
  createPlaylist,
  deletePlaylist
} from "../storage/playlist-storage.js";
import { createSongCard } from "../components/song-card.js";
import { showToast } from "../components/toast.js";
import { openModal } from "../components/modal.js";

let activeTab = "playlists";

function createTab(label, value) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "library-tab";
  button.textContent = label;
  button.dataset.tab = value;
  button.setAttribute("aria-pressed", String(activeTab === value));

  if (activeTab === value) button.classList.add("active");

  button.addEventListener("click", () => {
    activeTab = value;
    const container = document.getElementById("page-container");
    if (container) renderLibrary(container);
  });

  return button;
}

function createEmptyState(title, description) {
  const empty = document.createElement("div");
  empty.className = "library-empty surface";

  const icon = document.createElement("span");
  icon.className = "library-empty-icon";
  icon.textContent = "♫";

  const heading = document.createElement("h2");
  heading.textContent = title;

  const text = document.createElement("p");
  text.textContent = description;

  empty.append(icon, heading, text);
  return empty;
}

function renderFavorites(container) {
  const favorites = getFavorites();

  if (!favorites.length) {
    container.append(
      createEmptyState(
        "Belum ada lagu favorit",
        "Tambahkan lagu ke favorit untuk menemukannya di sini."
      )
    );
    return;
  }

  const grid = document.createElement("div");
  grid.className = "card-grid";

  favorites.forEach((track) => {
    const card = createSongCard(track);
    const button = card.querySelector('[data-action="toggle-favorite"]');

    if (button) {
      button.textContent = "♥";
      button.setAttribute("aria-pressed", "true");

      button.addEventListener("click", () => {
        removeFavorite(track.id);
        showToast("Lagu dihapus dari favorit.", "success");
        renderLibrary(container);
      });
    }

    grid.append(card);
  });

  container.append(grid);
}

function renderPlaylists(container) {
  const playlists = getPlaylists();

  const toolbar = document.createElement("div");
  toolbar.className = "library-toolbar";

  const description = document.createElement("p");
  description.textContent = "Kumpulan playlist pribadimu.";

  const createButton = document.createElement("button");
  createButton.type = "button";
  createButton.className = "primary-button";
  createButton.textContent = "+ Buat playlist";

  createButton.addEventListener("click", () => {
    const form = document.createElement("form");
    form.className = "playlist-create-form";

    const nameInput = document.createElement("input");
    nameInput.className = "search-input";
    nameInput.name = "playlistName";
    nameInput.placeholder = "Nama playlist";
    nameInput.maxLength = 80;
    nameInput.required = true;

    const descInput = document.createElement("input");
    descInput.className = "search-input";
    descInput.name = "playlistDescription";
    descInput.placeholder = "Deskripsi (opsional)";
    descInput.maxLength = 200;

    form.append(nameInput, descInput);

    openModal({
      title: "Buat playlist baru",
      content: form,
      confirmText: "Buat",
      onConfirm: () => {
        try {
          const playlist = createPlaylist(
            nameInput.value,
            descInput.value
          );

          showToast(`Playlist "${playlist.name}" dibuat.`, "success");
          renderLibrary(container);
        } catch (error) {
          showToast(error.message, "error");
        }
      }
    });
  });

  toolbar.append(description, createButton);
  container.append(toolbar);

  if (!playlists.length) {
    container.append(
      createEmptyState(
        "Playlist masih kosong",
        "Buat playlist untuk mengelompokkan musik favoritmu."
      )
    );
    return;
  }

  const grid = document.createElement("div");
  grid.className = "playlist-grid";

  playlists.forEach((playlist) => {
    const card = document.createElement("article");
    card.className = "playlist-library-card surface";

    const icon = document.createElement("div");
    icon.className = "playlist-library-icon";
    icon.textContent = "♫";

    const title = document.createElement("h3");
    title.textContent = playlist.name;

    const description = document.createElement("p");
    description.textContent =
      playlist.description || `${playlist.tracks.length} lagu`;

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "secondary-button";
    openButton.textContent = "Buka playlist";

    openButton.addEventListener("click", () => {
      sessionStorage.setItem("soniva:active-playlist", playlist.id);
      window.location.hash = "playlist";
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "icon-button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Hapus ${playlist.name}`);

    deleteButton.addEventListener("click", () => {
      openModal({
        title: "Hapus playlist?",
        content: `Playlist "${playlist.name}" akan dihapus dari koleksimu.`,
        confirmText: "Hapus",
        onConfirm: () => {
          deletePlaylist(playlist.id);
          showToast("Playlist dihapus.", "success");
          renderLibrary(container);
        }
      });
    });

    card.append(icon, title, description, openButton, deleteButton);
    grid.append(card);
  });

  container.append(grid);
}

export async function renderLibrary(container) {
  const page = document.createElement("section");
  page.className = "library-page";

  const header = document.createElement("header");
  header.className = "page-header";

  const title = document.createElement("h1");
  title.textContent = "Your Library";

  const description = document.createElement("p");
  description.textContent = "Semua koleksi musikmu di satu tempat.";

  header.append(title, description);

  const tabs = document.createElement("div");
  tabs.className = "library-tabs";

  tabs.append(
    createTab("Playlist", "playlists"),
    createTab("Lagu Favorit", "favorites")
  );

  const content = document.createElement("div");
  content.className = "library-content";

  if (activeTab === "favorites") {
    renderFavorites(content);
  } else {
    renderPlaylists(content);
  }

  page.append(header, tabs, content);
  container.replaceChildren(page);
}
