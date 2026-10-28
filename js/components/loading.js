
export function createLoading(message = "Memuat musik...") {
  const loading = document.createElement("div");

  loading.className = "soniva-loading";
  loading.setAttribute("role", "status");

  const icon = document.createElement("span");
  icon.className = "soniva-loading-icon";
  icon.textContent = "♫";

  const text = document.createElement("p");
  text.textContent = message;

  loading.append(icon, text);

  return loading;
}

export function showLoading(container, message) {
  container.replaceChildren(createLoading(message));
}
