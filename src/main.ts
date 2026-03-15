import * as i18n from "./i18n";
import {
  initialState,
  setOwnTtr,
  addOpponent,
  removeOpponent,
  setOpponentTtr,
  setOpponentWon,
  setResults,
  markStale,
  resetSession,
  type AppState,
} from "./state";
import { loadOwnTtr, saveOwnTtr } from "./storage";
import { calculateResults } from "./calculator";
import { render, type RenderCallbacks } from "./render";
import { t } from "./i18n";

// --------------------------------------------------------------------------
// Application state
// --------------------------------------------------------------------------

let state: AppState = initialState();

// --------------------------------------------------------------------------
// Render helper — always called with the latest state and callbacks
// --------------------------------------------------------------------------

function renderApp(): void {
  render(state, callbacks);
}

// --------------------------------------------------------------------------
// Event handlers
// --------------------------------------------------------------------------

function onOwnTtrChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  const raw = input.value.trim();
  if (raw === "") {
    state = setOwnTtr(state, null);
    state = markStale(state);
    renderApp();
    return;
  }
  const num = Number(raw);
  if (Number.isFinite(num)) {
    state = setOwnTtr(state, num);
    saveOwnTtr(num);
  } else {
    state = setOwnTtr(state, null);
  }
  state = markStale(state);
  renderApp();
}

function onCalculate(): void {
  if (state.opponents.every((o) => o.ttr !== null && o.ttr >= 0 && o.ttr <= 3000)) {
    const results = calculateResults(state);
    state = setResults(state, results);
    renderApp();
  }
}

function onReset(): void {
  const dialog = document.getElementById("reset-dialog") as HTMLDialogElement | null;
  if (dialog) {
    // Update dialog labels before opening
    const title = dialog.querySelector<HTMLElement>("#dialog-title");
    const msg = dialog.querySelector<HTMLElement>("#dialog-message");
    const confirmBtn = dialog.querySelector<HTMLButtonElement>("#btn-dialog-confirm");
    const cancelBtn = dialog.querySelector<HTMLButtonElement>("#btn-dialog-cancel");
    if (title) title.textContent = t("dialog.reset-title");
    if (msg) msg.textContent = t("dialog.reset-message");
    if (confirmBtn) confirmBtn.textContent = t("button.confirm");
    if (cancelBtn) cancelBtn.textContent = t("button.cancel");
    dialog.showModal();
  }
}

// --------------------------------------------------------------------------
// Render callbacks (stable references for opponent list events)
// --------------------------------------------------------------------------

const callbacks: RenderCallbacks = {
  onAddOpponent(): void {
    state = addOpponent(state);
    state = markStale(state);
    renderApp();
  },
  onRemoveOpponent(id: string): void {
    state = removeOpponent(state, id);
    state = markStale(state);
    renderApp();
  },
  onOpponentTtrChange(id: string, value: number | null): void {
    state = setOpponentTtr(state, id, value);
    state = markStale(state);
    renderApp();
  },
  onOpponentWonChange(id: string, won: boolean): void {
    state = setOpponentWon(state, id, won);
    state = markStale(state);
    renderApp();
  },
};

// --------------------------------------------------------------------------
// Initialisation
// --------------------------------------------------------------------------

async function init(): Promise<void> {
  await i18n.init();

  // Pre-fill own TTR from localStorage
  const savedTtr = loadOwnTtr();
  if (savedTtr !== null) {
    state = setOwnTtr(state, savedTtr);
  }

  // Wire static listeners (survive re-renders since they target stable elements)
  const ownTtrInput = document.getElementById("own-ttr-input") as HTMLInputElement | null;
  if (ownTtrInput) {
    ownTtrInput.addEventListener("input", onOwnTtrChange);
  }

  const calculateBtn = document.getElementById("btn-calculate") as HTMLButtonElement | null;
  if (calculateBtn) {
    calculateBtn.addEventListener("click", onCalculate);
  }

  const resetBtn = document.getElementById("btn-reset") as HTMLButtonElement | null;
  if (resetBtn) {
    resetBtn.addEventListener("click", onReset);
  }

  // Dialog buttons
  const dialog = document.getElementById("reset-dialog") as HTMLDialogElement | null;
  if (dialog) {
    const confirmBtn = dialog.querySelector<HTMLButtonElement>("#btn-dialog-confirm");
    const cancelBtn = dialog.querySelector<HTMLButtonElement>("#btn-dialog-cancel");

    confirmBtn?.addEventListener("click", () => {
      dialog.close();
      state = resetSession(state);
      renderApp();
    });

    cancelBtn?.addEventListener("click", () => {
      dialog.close();
    });

    // Close on Escape is handled natively by <dialog>
  }

  // Initial render
  renderApp();
}

init().catch((err: unknown) => {
  console.error("App failed to initialize", err);
});
