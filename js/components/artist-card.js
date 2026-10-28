
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

export function createArtistCard(artist) {
  const card = document.createElement("article");
  card.className = "artist-card";
  card.dataset.artistId = String(artist.id || "");

  const name = escapeHTML(artist.name || "Unknown Artist");
  const image = escapeHTML(artist.image || "");

  card.innerHTML = `
    <button class="artist-card-button" type="button"
      data-action="open-artist">

      <div class="artist-card-image">
        ${
          image
            ? `<img src="${image}" alt="" loading="lazy">`
            : `<div class="cover-placeholder">♪</div>`
        }
      </div>

      <h3 class="artist-card-name">${name}</h3>
      <p class="artist-card-label">Artist</p>
    </button>
  `;

  return card;
}
