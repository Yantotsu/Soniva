
import { showToast } from "../components/toast.js";

const demoAlbum = {
  id: "album-demo",
  name: "Midnight Dreams",
  artist: "Luna Sounds",
  year: 2026,
  cover: "",
  tracks: [
    { id: "track-1", name: "Midnight Dreams", duration: "3:34" },
    { id: "track-2", name: "Neon Lights", duration: "3:18" },
    { id: "track-3", name: "After the Rain", duration: "3:45" },
    { id: "track-4", name: "Starlight", duration: "3:25" }
  ]
};

export async function renderAlbum(container) {
  const album = demoAlbum;

  const page = document.createElement("section");
  page.className = "album-page";

  const hero = document.createElement("header");
  hero.className = "album-hero";

  const cover = document.createElement("div");
  cover.className = "album-hero-cover";

  if (album.cover) {
    const image = document.createElement("img");
    image.src = album.cover;
    image.alt = `Cover ${album.name}`;
    cover.append(image);
  } else {
    cover.textContent = "♫";
  }

  const info = document.createElement("div");
  info.className = "album-hero-info";

  const eyebrow = document.createElement("span");
  eyebrow.className = "album-eyebrow";
  eyebrow.textContent = "ALBUM";

  const title = document.createElement("h1");
  title.textContent = album.name;

  const artist = document.createElement("p");
  artist.className = "album-artist-name";
  artist.textContent = album.artist;

  const metadata = document.createElement("p");
  metadata.className = "album-metadata";
  metadata.textContent = `${album.year} · ${album.tracks.length} lagu`;

  const playButton = document.createElement("button");
  playButton.type = "button";
  playButton.className = "primary-button";
  playButton.textContent = "▶  Putar album";

  playButton.addEventListener("click", () => {
    showToast("Player akan dihubungkan pada tahap Music Player.");
  });

  info.append(eyebrow, title, artist, metadata, playButton);
  hero.append(cover, info);

  const trackSection = document.createElement("section");
  trackSection.className = "album-track-section";

  const heading = document.createElement("h2");
  heading.textContent = "Daftar lagu";

  const list = document.createElement("div");
  list.className = "album-track-list";

  album.tracks.forEach((track, index) => {
    const row = document.createElement("div");
    row.className = "album-track-row";

    const number = document.createElement("span");
    number.className = "album-track-number";
    number.textContent = String(index + 1);

    const trackInfo = document.createElement("div");
    trackInfo.className = "album-track-info";

    const trackTitle = document.createElement("span");
    trackTitle.className = "album-track-title";
    trackTitle.textContent = track.name;

    const trackArtist = document.createElement("span");
    trackArtist.className = "album-track-artist";
    trackArtist.textContent = album.artist;

    trackInfo.append(trackTitle, trackArtist);

    const duration = document.createElement("span");
    duration.className = "album-track-duration";
    duration.textContent = track.duration;

    const playTrack = document.createElement("button");
    playTrack.type = "button";
    playTrack.className = "icon-button";
    playTrack.textContent = "▶";
    playTrack.setAttribute("aria-label", `Putar ${track.name}`);

    playTrack.addEventListener("click", () => {
      showToast(`Player belum tersedia untuk ${track.name}.`);
    });

    row.append(number, trackInfo, duration, playTrack);
    list.append(row);
  });

  trackSection.append(heading, list);
  page.append(hero, trackSection);
  container.replaceChildren(page);
}
