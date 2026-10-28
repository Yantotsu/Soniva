
import { createSongCard } from "../components/song-card.js";
import { createAlbumCard } from "../components/album-card.js";
import { createArtistCard } from "../components/artist-card.js";
import { createLoading } from "../components/loading.js";
import { showToast } from "../components/toast.js";

const demoData = {
  songs: [
    {
      id: "demo-song-1",
      name: "Midnight Dreams",
      artist: "Soniva Radio",
      cover: "",
      duration: 214000
    },
    {
      id: "demo-song-2",
      name: "Neon Lights",
      artist: "Luna Sounds",
      cover: "",
      duration: 198000
    },
    {
      id: "demo-song-3",
      name: "After the Rain",
      artist: "Mika",
      cover: "",
      duration: 225000
    },
    {
      id: "demo-song-4",
      name: "Starlight",
      artist: "Dreamscape",
      cover: "",
      duration: 205000
    }
  ],

  albums: [
    {
      id: "demo-album-1",
      name: "Night Drive",
      artist: "Luna Sounds",
      cover: ""
    },
    {
      id: "demo-album-2",
      name: "Blue Horizon",
      artist: "Mika",
      cover: ""
    },
    {
      id: "demo-album-3",
      name: "Afterglow",
      artist: "Dreamscape",
      cover: ""
    },
    {
      id: "demo-album-4",
      name: "Moonlight",
      artist: "Various Artists",
      cover: ""
    }
  ],

  artists: [
    { id: "demo-artist-1", name: "Luna Sounds", image: "" },
    { id: "demo-artist-2", name: "Mika", image: "" },
    { id: "demo-artist-3", name: "Dreamscape", image: "" },
    { id: "demo-artist-4", name: "Soniva Radio", image: "" }
  ]
};

function createSection(title, subtitle, className = "") {
  const section = document.createElement("section");
  section.className = `home-section ${className}`.trim();

  const heading = document.createElement("div");
  heading.className = "section-heading";

  const text = document.createElement("div");

  const titleElement = document.createElement("h2");
  titleElement.textContent = title;

  text.append(titleElement);

  if (subtitle) {
    const description = document.createElement("p");
    description.className = "home-section-subtitle";
    description.textContent = subtitle;
    text.append(description);
  }

  heading.append(text);
  section.append(heading);

  return section;
}

function createCardGrid(className = "") {
  const grid = document.createElement("div");
  grid.className = `card-grid ${className}`.trim();
  return grid;
}

function createGreeting() {
  const header = document.createElement("section");
  header.className = "home-hero";

  const greeting = document.createElement("div");

  const eyebrow = document.createElement("p");
  eyebrow.className = "home-eyebrow";
  eyebrow.textContent = "YOUR MUSIC, YOUR WORLD";

  const title = document.createElement("h1");
  title.textContent = "Temukan irama harimu.";

  const description = document.createElement("p");
  description.textContent =
    "Musik yang cocok untuk setiap suasana, semuanya di satu tempat.";

  greeting.append(eyebrow, title, description);

  const searchButton = document.createElement("button");
  searchButton.type = "button";
  searchButton.className = "primary-button home-search-button";
  searchButton.textContent = "⌕  Cari musik";

  searchButton.addEventListener("click", () => {
    window.location.hash = "search";
  });

  header.append(greeting, searchButton);

  return header;
}

function createQuickAccess() {
  const section = createSection(
    "Akses cepat",
    "Lanjutkan perjalanan musikmu."
  );

  const grid = document.createElement("div");
  grid.className = "quick-access-grid";

  const items = [
    { icon: "♥", label: "Lagu Favorit", route: "library" },
    { icon: "◷", label: "Baru Diputar", route: "history" },
    { icon: "♫", label: "Jelajahi Musik", route: "explore" },
    { icon: "▤", label: "Koleksi Musik", route: "library" }
  ];

  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quick-access-card";

    const icon = document.createElement("span");
    icon.className = "quick-access-icon";
    icon.textContent = item.icon;

    const label = document.createElement("span");
    label.className = "quick-access-label";
    label.textContent = item.label;

    button.append(icon, label);

    button.addEventListener("click", () => {
      window.location.hash = item.route;
    });

    grid.append(button);
  });

  section.append(grid);
  return section;
}

function renderCards(section, items, createCard) {
  const grid = createCardGrid();

  items.forEach((item) => {
    grid.append(createCard(item));
  });

  section.append(grid);
}

function createSongSection() {
  const section = createSection(
    "Pilihan untukmu",
    "Temukan musik untuk menemani harimu."
  );

  renderCards(section, demoData.songs, createSongCard);

  return section;
}

function createAlbumSection() {
  const section = createSection(
    "Album pilihan",
    "Jelajahi koleksi album."
  );

  renderCards(section, demoData.albums, createAlbumCard);

  return section;
}

function createArtistSection() {
  const section = createSection(
    "Artis pilihan",
    "Kenali musisi dan temukan karya mereka."
  );

  renderCards(section, demoData.artists, createArtistCard);

  return section;
}

export async function renderHome(container) {
  container.replaceChildren(createLoading("Menyiapkan beranda..."));

  // Data ini masih contoh lokal, bukan hasil Spotify API.
  const fragment = document.createDocumentFragment();

  fragment.append(
    createGreeting(),
    createQuickAccess(),
    createSongSection(),
    createAlbumSection(),
    createArtistSection()
  );

  container.replaceChildren(fragment);

  // Listener untuk tombol komponen akan dihubungkan
  // dengan player pada tahap integrasi musik.
  container.querySelectorAll('[data-action="play-track"]')
    .forEach((button) => {
      button.addEventListener("click", () => {
        showToast(
          "Player akan dihubungkan pada tahap Music Player.",
          "info"
        );
      });
    });

  container.querySelectorAll('[data-action="open-track"]')
    .forEach((button) => {
      button.addEventListener("click", () => {
        showToast(
          "Detail lagu akan tersedia setelah integrasi katalog.",
          "info"
        );
      });
    });

  container.querySelectorAll('[data-action="open-album"]')
    .forEach((button) => {
      button.addEventListener("click", () => {
        window.location.hash = "album";
      });
    });

  container.querySelectorAll('[data-action="open-artist"]')
    .forEach((button) => {
      button.addEventListener("click", () => {
        window.location.hash = "artist";
      });
    });

  container.querySelectorAll('[data-action="toggle-favorite"]')
    .forEach((button) => {
      button.addEventListener("click", () => {
        showToast(
          "Fitur favorit akan dihubungkan pada tahap Library.",
          "info"
        );
      });
    });
}
