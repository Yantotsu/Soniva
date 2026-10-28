
export function openModal({
  title = "Soniva",
  content = "",
  confirmText = "OK",
  cancelText = "Batal",
  onConfirm = null
} = {}) {
  const root = document.getElementById("modal-root");

  if (!root) return;

  closeModal();

  const overlay = document.createElement("div");
  overlay.className = "soniva-modal-overlay";

  const dialog = document.createElement("section");
  dialog.className = "soniva-modal";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "soniva-modal-title");

  const heading = document.createElement("h2");
  heading.id = "soniva-modal-title";
  heading.textContent = title;

  const body = document.createElement("div");
  body.className = "soniva-modal-content";

  if (content instanceof Node) {
    body.append(content);
  } else {
    body.textContent = String(content);
  }

  const actions = document.createElement("div");
  actions.className = "soniva-modal-actions";

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "secondary-button";
  cancel.textContent = cancelText;

  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className = "primary-button";
  confirm.textContent = confirmText;

  cancel.addEventListener("click", closeModal);

  confirm.addEventListener("click", async () => {
    if (onConfirm) {
      await onConfirm();
    }

    closeModal();
  });

  actions.append(cancel, confirm);
  dialog.append(heading, body, actions);
  overlay.append(dialog);
  root.append(overlay);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeModal();
  });

  const handleEscape = (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };

  document.addEventListener("keydown", handleEscape, { once: true });

  cancel.focus();
}

export function closeModal() {
  document.getElementById("modal-root")?.replaceChildren();
}
