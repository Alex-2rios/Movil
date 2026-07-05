const overlay = document.getElementById("confirmOverlay");
const message = document.getElementById("confirmMessage");
const cancelButton = document.getElementById("cancelConfirm");
const acceptButton = document.getElementById("acceptConfirm");

let pendingAction = null;

function openConfirm(text, action) {
  pendingAction = action;
  message.textContent = text || "¿Deseas continuar?";
  overlay.classList.add("visible");
  overlay.setAttribute("aria-hidden", "false");
  acceptButton.focus();
}

function closeConfirm() {
  pendingAction = null;
  overlay.classList.remove("visible");
  overlay.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-confirm]");
  if (!trigger || trigger.tagName === "FORM") return;

  event.preventDefault();
  openConfirm(trigger.dataset.confirm, () => {
    window.location.href = trigger.href;
  });
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("form[data-confirm]");
  if (!form || form.dataset.confirmed === "true") return;

  event.preventDefault();
  openConfirm(form.dataset.confirm, () => {
    form.dataset.confirmed = "true";
    form.submit();
  });
});

cancelButton.addEventListener("click", closeConfirm);

acceptButton.addEventListener("click", () => {
  const action = pendingAction;
  closeConfirm();
  if (action) action();
});

overlay.addEventListener("click", (event) => {
  if (event.target === overlay) closeConfirm();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && overlay.classList.contains("visible")) {
    closeConfirm();
  }
});
