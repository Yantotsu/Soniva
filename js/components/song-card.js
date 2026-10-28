
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

export function createSongCard(track) {
  const card = document.createElement("article");
  card.className = "song-card";

  const title = escapeHTML(track.name || "Unknown Track");
  const artist = escapeHTML(track.artist || "Unknown Artist");
  const cover = escapeHTML(track.cover || "");
  const id = escapeHTML(track.id || "");

  card.innerHTML = `
    <div class="song-card-cover">
      ${
        cover
          ? `<img src="${cover}" alt="" loading="lazy">`
          : `<div class="cover-placeholder">♫</div>`
      }

      <button
        class="song-play-button"
        type="button"
        data-action="play-track"
        aria-label="Putar ${title}"
      >▶</button>
    </div>

    <div class="song-card-info">
      <button
        class="song-card-title"
        type="button"
        data-action="open-track"
      >${title}</button>

      <p class="song-card-artist">${artist}</p>
    </div>

    <button
      class="song-favorite-button"
      type="button"
      data-action="toggle-favorite"
      aria-label="Tambah ke favorit"
      aria-pressed="false"
    >♡</button>
  `;

  card.dataset.trackId = id;

  return card;
}
