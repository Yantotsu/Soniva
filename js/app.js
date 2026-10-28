
import { renderLibrary } from "./pages/library.js";
import { renderPlaylist } from "./pages/playlist.js";
import { renderAlbum } from "./pages/album.js";
import { renderArtist } from "./pages/artist.js";
import { renderSearch } from "./pages/search.js";
import { renderExplore } from "./pages/explore.js";
import { renderHome } from "./pages/home.js";
import { APP_CONFIG } from "./config.js";
import {
  registerRoute,
  initRouter,
  navigate,
  goBack,
  goForward
} from "./router.js";

import { appState } from "./state.js";

const pageTitles = {
  home: "Home",
  search: "Search",
  explore: "Explore",
  library: "Your Library",
  album: "Album",
  artist: "Artist",
  playlist: "Playlist",
  queue: "Playing Queue",
  settings: "Settings",
  profile: "Profile",
  "now-playing": "Now Playing"
};

function renderPlaceholder(container, title) {
  container.innerHTML = `
    <section class="page-header">
      <h1>${title}</h1>
      <p>Selamat datang di Soniva Music.</p>
    </section>

    <section class="placeholder-panel surface">
      <div class="placeholder-icon">♫</div>
      <h2>${title}</h2>
      <p>Halaman ini akan dibuat pada tahap berikutnya.</p>
    </section>
  `;
}



for (const route of APP_CONFIG.routes) {
  registerRoute(route, (container) => {
    appState.activeTab = route;

    if (route === "home") {
      return renderHome(container);
    }

    if (route === "search") {
      return renderSearch(container);
    }

    if (route === "explore") {
      return renderExplore(container);
    }
    
    if (route === "album") {
      return renderAlbum(container);
    }
    
    if (route === "artist") {
      return renderArtist(container);
    }

    if (route === "library") {
      return renderLibrary(container);
    }
    
    if (route === "playlist") {
      return renderPlaylist(container);
    }

    renderPlaceholder(
      container,
      pageTitles[route] || "Soniva Music"
    );
  });
}



function initApp() {
  document.title = APP_CONFIG.name;

  document.getElementById("back-button")?.addEventListener(
    "click",
    goBack
  );

  document.getElementById("forward-button")?.addEventListener(
    "click",
    goForward
  );

  document.getElementById("search-shortcut")?.addEventListener(
    "click",
    () => navigate("search")
  );

  document.getElementById("profile-button")?.addEventListener(
    "click",
    () => navigate("profile")
  );

  initRouter();

  console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} siap.`);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp, {
    once: true
  });
} else {
  initApp();
}
