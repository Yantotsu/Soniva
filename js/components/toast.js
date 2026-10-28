
let toastTimer;

export function showToast(message, type = "info", duration = 2500) {
  const root = document.getElementById("toast-root");

  if (!root) return;

  clearTimeout(toastTimer);

  const toast = document.createElement("div");
  toast.className = `soniva-toast toast-${type}`;
  toast.setAttribute("role", "status");
  toast.textContent = message;

  root.replaceChildren(toast);

  requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");

    setTimeout(() => {
      if (toast.parentElement === root) {
        toast.remove();
      }
    }, 200);
  }, duration);
}
