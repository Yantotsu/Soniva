
const genres = [
  { name: "Pop", icon: "♫", color: "#7d4ce0", query: "pop" },
  { name: "Rock", icon: "⚡", color: "#b94d64", query: "rock" },
  { name: "Jazz", icon: "♬", color: "#287e91", query: "jazz" },
  { name: "Electronic", icon: "◈", color: "#6256cc", query: "electronic" },
  { name: "Indie", icon: "✦", color: "#3c886d", query: "indie" },
  { name: "Classical", icon: "♩", color: "#a66e40", query: "classical" },
  { name: "Anime", icon: "✧", color: "#c653a0", query: "anime" },
  { name: "Lo-fi", icon: "☾", color: "#4569a9", query: "lofi" },
  { name: "R&B", icon: "♡", color: "#9b4e82", query: "r&b" },
  { name: "Hip-hop", icon: "▰", color: "#7c6541", query: "hip hop" },
  { name: "Acoustic", icon: "♬", color: "#4b8a7b", query: "acoustic" },
  { name: "Soundtrack", icon: "♫", color: "#6950a8", query: "soundtrack" }
];

function createGenreCard(genre) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "genre-card";
  button.style.setProperty("--genre-color", genre.color);

  const icon = document.createElement("span");
  icon.className = "genre-card-icon";
  icon.textContent = genre.icon;

  const title = document.createElement("span");
  title.className = "genre-card-title";
  title.textContent = genre.name;

  button.append(icon, title);

  button.addEventListener("click", () => {
    sessionStorage.setItem("soniva:search-query", genre.query);
    window.location.hash = "search";
  });

  return button;
}

export async function renderExplore(container) {
  const page = document.createElement("section");
  page.className = "explore-page";

  const header = document.createElement("header");
  header.className = "page-header";

  const title = document.createElement("h1");
  title.textContent = "Explore";

  const description = document.createElement("p");
  description.textContent =
    "Jelajahi genre, suasana, dan suara baru.";

  header.append(title, description);

  const sectionTitle = document.createElement("h2");
  sectionTitle.className = "explore-section-title";
  sectionTitle.textContent = "Jelajahi berdasarkan genre";

  const grid = document.createElement("div");
  grid.className = "genre-grid";

  genres.forEach((genre) => {
    grid.append(createGenreCard(genre));
  });

  page.append(header, sectionTitle, grid);
  container.replaceChildren(page);
}
