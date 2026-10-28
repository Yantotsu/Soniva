
import { createSongCard } from "../components/song-card.js";
import { createAlbumCard } from "../components/album-card.js";
import { createArtistCard } from "../components/artist-card.js";
import { showToast } from "../components/toast.js";

const demoCatalog = {
  songs: [
    { id: "s1", name: "Midnight Dreams", artist: "Luna Sounds", cover: "" },
    { id: "s2", name: "Neon Lights", artist: "Mika", cover: "" },
    { id: "s3", name: "After the Rain", artist: "Dreamscape", cover: "" },
    { id: "s4", name: "Starlight", artist: "Luna Sounds", cover: "" },
    { id: "s5", name: "Ocean Blue", artist: "Mika", cover: "" }
  ],
  albums: [
    { id: "a1", name: "Night Drive", artist: "Luna Sounds", cover: "" },
    { id: "a2", name: "Blue Horizon", artist: "Mika", cover: "" },
    { id: "a3", name: "Afterglow", artist: "Dreamscape", cover: "" }
  ],
  artists: [
    { id: "ar1", name: "Luna Sounds", image: "" },
    { id: "ar2", name: "Mika", image: "" },
    { id: "ar3", name: "Dreamscape", image: "" }
  ]
};

const categories = [
  { id: "all", label: "Semua" },
  { id: "songs", label: "Lagu" },
  { id: "albums", label: "Album" },
  { id: "artists", label: "Artis" }
];

let currentCategory = "all";
let searchTimer = null;
let activeCleanup = null;

function normalize(value) {
  return String(value || "")
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matches(item, query, type) {
  const fields = type === "artists"
    ? [item.name]
    : [item.name, item.artist];

  return fields.some((field) =>
    normalize(field).includes(normalize(query))
  );
}

function createSection(title, items, createCard) {
  const section = document.createElement("section");
  section.className = "search-result-section";

  const heading = document.createElement("h2");
  heading.className = "search-result-heading";
  heading.textContent = title;

  const grid = document.createElement("div");
  grid.className = "card-grid";

  items.forEach((item) => {
    grid.append(createCard(item));
  });

  section.append(heading, grid);
  return section;
}

function createEmptyState(query) {
  const empty = document.createElement("div");
  empty.className = "search-empty-state";

  const icon = document.createElement("span");
  icon.textContent = "⌕";

  const heading = document.createElement("h2");
  heading.textContent = "Musik tidak ditemukan";

  const description = document.createElement("p");
  description.textContent =
    `Tidak ada hasil untuk "${query}". Coba kata kunci lain.`;

  empty.append(icon, heading, description);
  return empty;
}

function createResults(container, query) {
  const results = document.createElement("div");
  results.className = "search-results";

  if (!query.trim()) {
    const prompt = document.createElement("div");
    prompt.className = "search-prompt";

    const heading = document.createElement("h2");
    heading.textContent = "Cari musik favoritmu";

    const description = document.createElement("p");
    description.textContent =
      "Masukkan judul lagu, nama album, atau artis.";

    prompt.append(heading, description);
    results.append(prompt);
    container.replaceChildren(results);
    return;
  }

  const types = currentCategory === "all"
    ? ["songs", "albums", "artists"]
    : [currentCategory];

  let total = 0;

  const renderers = {
    songs: {
      title: "Lagu",
      createCard: createSongCard
    },
    albums: {
      title: "Album",
      createCard: createAlbumCard
    },
    artists: {
      title: "Artis",
      createCard: createArtistCard
    }
  };

  for (const type of types) {
    const found = demoCatalog[type].filter((item) =>
      matches(item, query, type)
    );

    total += found.length;

    if (found.length) {
      const section = createSection(
        renderers[type].title,
        found,
        renderers[type].createCard
      );

      results.append(section);
    }
  }

  if (total === 0) {
    results.append(createEmptyState(query));
  }

  container.replaceChildren(results);

  results.querySelectorAll('[data-action="play-track"]')
    .forEach((button) => {
      button.addEventListener("click", () => {
        showToast("Player akan dihubungkan pada tahap berikutnya.");
      });
    });

  results.querySelectorAll('[data-action="open-track"]')
    .forEach((button) => {
      button.addEventListener("click", () => {
        showToast("Detail lagu belum terhubung ke katalog.");
      });
    });

  results.querySelectorAll('[data-action="toggle-favorite"]')
    .forEach((button) => {
      button.addEventListener("click", () => {
        showToast("Favorit akan diaktifkan pada tahap Library.");
      });
    });

  results.querySelectorAll('[data-action="open-album"]')
    .forEach((button) => {
      button.addEventListener("click", () => {
        window.location.hash = "album";
      });
    });

  results.querySelectorAll('[data-action="open-artist"]')
    .forEach((button) => {
      button.addEventListener("click", () => {
        window.location.hash = "artist";
      });
    });
}

export async function renderSearch(container) {
  if (activeCleanup) activeCleanup();

  currentCategory = "all";

  const page = document.createElement("section");
  page.className = "search-page";

  const header = document.createElement("header");
  header.className = "page-header";

  const title = document.createElement("h1");
  title.textContent = "Search";

  const subtitle = document.createElement("p");
  subtitle.textContent = "Temukan lagu, album, dan artis favoritmu.";

  header.append(title, subtitle);

  const form = document.createElement("form");
  form.className = "search-form";
  form.setAttribute("role", "search");

  const input = document.createElement("input");
  input.type = "search";
  input.className = "search-input";
  input.placeholder = "Apa yang ingin kamu dengarkan?";
  input.setAttribute("aria-label", "Cari lagu, album, atau artis");
  input.autocomplete = "off";

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "primary-button";
  submit.textContent = "Cari";

  form.append(input, submit);

  const filters = document.createElement("div");
  filters.className = "search-filters";
  filters.setAttribute("aria-label", "Filter hasil pencarian");

  const resultsContainer = document.createElement("div");
  resultsContainer.className = "search-results-container";

  function updateResults() {
    createResults(resultsContainer, input.value.trim());
  }

  function selectCategory(category) {
    currentCategory = category;

    filters.querySelectorAll("button").forEach((button) => {
      const active = button.dataset.category === category;

      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    updateResults();
  }

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-filter";
    button.textContent = category.label;
    button.dataset.category = category.id;
    button.setAttribute(
      "aria-pressed",
      String(category.id === currentCategory)
    );

    if (category.id === currentCategory) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      selectCategory(category.id);
    });

    filters.append(button);
  });

const savedQuery = sessionStorage.getItem("soniva:search-query");

if (savedQuery) {
  input.value = savedQuery;
  sessionStorage.removeItem("soniva:search-query");
}

  const onInput = () => {
    clearTimeout(searchTimer);

    searchTimer = setTimeout(updateResults, 250);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    clearTimeout(searchTimer);
    updateResults();
  };

  input.addEventListener("input", onInput);
  form.addEventListener("submit", onSubmit);

  page.append(header, form, filters, resultsContainer);
  container.replaceChildren(page);

  updateResults();
  input.focus({ preventScroll: true });

  activeCleanup = () => {
    clearTimeout(searchTimer);
    input.removeEventListener("input", onInput);
    form.removeEventListener("submit", onSubmit);
    activeCleanup = null;
  };
}
