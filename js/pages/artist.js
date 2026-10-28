
import { createAlbumCard } from "../components/album-card.js";
import { showToast } from "../components/toast.js";

const demoArtist = {
  id: "artist-demo",
  name: "Luna Sounds",
  image: "",
  followers: "1,2 juta",
  monthlyListeners: "850 ribu",
  albums: [
    {
      id: "album-1",
      name: "Midnight Dreams",
      artist: "Luna Sounds",
      cover: ""
    },
    {
      id: "album-2",
      name: "Night Drive",
      artist: "Luna Sounds",
      cover: ""
    },
    {
      id: "album-3",
      name: "Afterglow",
      artist: "Luna Sounds",
      cover: ""
    }
  ]
};

export async function renderArtist(container) {
  const artist = demoArtist;

  const page = document.createElement("section");
  page.className = "artist-page";

  const hero = document.createElement("header");
  hero.className = "artist-hero";

  const image = document.createElement("div");
  image.className = "artist-hero-image";

  if (artist.image) {
    const img = document.createElement("img");
    img.src = artist.image;
    img.alt = artist.name;
    image.append(img);
  } else {
    image.textContent = "♪";
  }

  const info = document.createElement("div");
  info.className = "artist-hero-info";

  const verified = document.createElement("span");
  verified.className = "artist-verified";
  verified.textContent = "ARTIS";

  const name = document.createElement("h1");
  name.textContent = artist.name;

  const listeners = document.createElement("p");
  listeners.textContent =
    `${artist.monthlyListeners} pendengar bulanan`;

  const followers = document.createElement("p");
  followers.textContent = `${artist.followers} pengikut`;

  const playButton = document.createElement("button");
  playButton.type = "button";
  playButton.className = "primary-button";
  playButton.textContent = "▶  Putar";

  playButton.addEventListener("click", () => {
    showToast("Pemutaran artis akan tersedia setelah integrasi player.");
  });

  info.append(verified, name, listeners, followers, playButton);
  hero.append(image, info);

  const albumSection = document.createElement("section");
  albumSection.className = "artist-albums-section";

  const heading = document.createElement("h2");
  heading.textContent = "Album";

  const grid = document.createElement("div");
  grid.className = "card-grid";

  artist.albums.forEach((album) => {
    grid.append(createAlbumCard(album));
  });

  albumSection.append(heading, grid);
  page.append(hero, albumSection);
  container.replaceChildren(page);

  page.querySelectorAll('[data-action="open-album"]')
    .forEach((button) => {
      button.addEventListener("click", () => {
        window.location.hash = "album";
      });
    });
}
