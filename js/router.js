
const routes = new Map();

let currentRoute = null;
let previousRoute = null;

const DEFAULT_ROUTE = "home";

export function registerRoute(name, render) {
  if (typeof name !== "string" || typeof render !== "function") {
    throw new TypeError("Route harus memiliki nama dan fungsi render.");
  }

  routes.set(name, render);
}

export function getCurrentRoute() {
  return currentRoute;
}

export function navigate(routeName) {
  if (!routes.has(routeName)) {
    console.warn(`Soniva: route "${routeName}" tidak ditemukan.`);
    routeName = DEFAULT_ROUTE;
  }

  if (window.location.hash !== `#${routeName}`) {
    window.location.hash = routeName;
    return;
  }

  renderRoute(routeName);
}

async function renderRoute(routeName) {
  const container = document.getElementById("page-container");

  if (!container) {
    console.error("Elemen #page-container tidak ditemukan.");
    return;
  }

  const render = routes.get(routeName);

  if (!render) {
    console.error(`Renderer untuk "${routeName}" tidak tersedia.`);
    return;
  }

  previousRoute = currentRoute;
  currentRoute = routeName;

  updateNavigation(routeName);

  container.setAttribute("aria-busy", "true");

  try {
    await render(container);
  } catch (error) {
    console.error(`Gagal membuka halaman ${routeName}:`, error);

    container.innerHTML = `
      <section class="page-error">
        <h2>Halaman tidak dapat dibuka</h2>
        <p>Terjadi masalah saat menampilkan halaman ini.</p>
        <button class="primary-button" data-action="retry-route">
          Coba lagi
        </button>
      </section>
    `;
  } finally {
    container.removeAttribute("aria-busy");
  }

  document.getElementById("main-content")?.focus({
    preventScroll: true
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateNavigation(routeName) {
  document.querySelectorAll("[data-route]").forEach((link) => {
    const isActive = link.dataset.route === routeName;

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

export function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    navigate(DEFAULT_ROUTE);
  }
}

export function goForward() {
  window.history.forward();
}

export function initRouter() {
  window.addEventListener("hashchange", () => {
    const routeName = window.location.hash.slice(1) || DEFAULT_ROUTE;

    if (routes.has(routeName)) {
      renderRoute(routeName);
    } else {
      navigate(DEFAULT_ROUTE);
    }
  });

  const initialRoute = window.location.hash.slice(1);

  if (initialRoute && routes.has(initialRoute)) {
    renderRoute(initialRoute);
  } else {
    navigate(DEFAULT_ROUTE);
  }

  document.addEventListener("click", (event) => {
    const retryButton = event.target.closest(
      '[data-action="retry-route"]'
    );

    if (retryButton && currentRoute) {
      renderRoute(currentRoute);
    }
  });
}
