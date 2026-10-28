
export const appState = {
  currentUser: null,
  currentTrack: null,
  currentAlbum: null,
  currentArtist: null,
  currentPlaylist: null,

  isPlaying: false,
  isLoading: false,

  queue: [],
  searchQuery: "",
  activeTab: "home",

  favorites: [],
  recentlyPlayed: [],

  settings: {
    theme: "dark",
    autoplay: true,
    crossfade: false
  }
};

export function updateState(updates) {
  Object.assign(appState, updates);

  window.dispatchEvent(
    new CustomEvent("soniva:statechange", {
      detail: { ...updates }
    })
  );
}

export function subscribeState(callback) {
  window.addEventListener("soniva:statechange", (event) => {
    callback(event.detail, appState);
  });
}
