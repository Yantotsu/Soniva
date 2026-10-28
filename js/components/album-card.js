
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

export function createAlbumCard(album) {
  const card = document.createElement("article");
  card.className = "album-card";
  card.dataset.albumId = String(album.id || "");

  const title = escapeHTML(album.name || "Unknown Album");
  const artist = escapeHTML(album.artist || "Unknown Artist");
  const cover = escapeHTML(album.cover || "");

  card.innerHTML = `
    <button class="album-card-button" type="button"
      data-action="open-album">

      <div class="album-card-cover">
        ${
          cover
            ? `<img src="${cover}" alt="" loading="lazy">`
            : `<div class="cover-placeholder">♫</div>`
        }
      </div>

      <h3 class="album-card-title">${title}</h3>
      <p class="album-card-artist">${artist}</p>
    </button>
  `;

  return card;
}
