import { t } from "./i18n";
import type { AppState } from "./state";

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function isCalculationAllowed(state: AppState): boolean {
  return (
    state.ownTtr !== null &&
    state.opponents.length > 0 &&
    state.opponents.every((o) => o.ttr !== null && o.ttr >= 0 && o.ttr <= 3000)
  );
}

function formatDelta(delta: number): string {
  if (delta > 0) return `+${Math.round(delta)}`;
  return String(Math.round(delta));
}

// --------------------------------------------------------------------------
// Own TTR section
// --------------------------------------------------------------------------

function renderOwnTtr(state: AppState, container: HTMLElement): void {
  const group = container.querySelector<HTMLElement>("#own-ttr-group");
  if (!group) return;

  const label = group.querySelector<HTMLLabelElement>("label");
  const input = group.querySelector<HTMLInputElement>("input");
  if (!label || !input) return;

  label.textContent = t("own-ttr.label");
  input.value = state.ownTtr !== null ? String(state.ownTtr) : "";
}

// --------------------------------------------------------------------------
// Opponent list
// --------------------------------------------------------------------------

function renderOpponentList(
  state: AppState,
  container: HTMLElement,
  onAddOpponent: () => void,
  onRemoveOpponent: (id: string) => void,
  onOpponentTtrChange: (id: string, value: number | null) => void,
  onOpponentWonChange: (id: string, won: boolean) => void,
): void {
  const list = container.querySelector<HTMLElement>("#opponent-list");
  const addBtn = container.querySelector<HTMLButtonElement>("#btn-add-opponent");
  if (!list || !addBtn) return;

  // Full re-render of opponent rows
  list.innerHTML = "";

  state.opponents.forEach((opp, index) => {
    const rowNum = index + 1;
    const row = document.createElement("div");
    row.className = "opponent-row";
    row.dataset.id = opp.id;
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", t("opponent.label", { number: rowNum }));

    // Label
    const rowLabel = document.createElement("span");
    rowLabel.className = "opponent-label";
    rowLabel.textContent = t("opponent.label", { number: rowNum });
    rowLabel.setAttribute("aria-hidden", "true");
    row.appendChild(rowLabel);

    // TTR Input group
    const ttrGroup = document.createElement("div");
    ttrGroup.className = "opponent-ttr-group";

    const ttrLabelEl = document.createElement("label");
    const ttrInputId = `opp-ttr-${opp.id}`;
    ttrLabelEl.htmlFor = ttrInputId;
    ttrLabelEl.className = "visually-hidden";
    ttrLabelEl.textContent = t("opponent.ttr-label", { number: rowNum });

    const ttrInput = document.createElement("input");
    ttrInput.id = ttrInputId;
    ttrInput.type = "number";
    ttrInput.min = "0";
    ttrInput.max = "3000";
    ttrInput.className = "opponent-ttr-input";
    ttrInput.setAttribute("aria-label", t("opponent.ttr-label", { number: rowNum }));
    if (opp.ttr !== null) {
      ttrInput.value = String(opp.ttr);
    } else {
      ttrInput.value = "";
      ttrInput.classList.add("invalid");
    }

    ttrInput.addEventListener("input", () => {
      const raw = ttrInput.value.trim();
      if (raw === "") {
        onOpponentTtrChange(opp.id, null);
        return;
      }
      const num = Number(raw);
      if (!Number.isFinite(num) || num < 0 || num > 3000) {
        onOpponentTtrChange(opp.id, null);
      } else {
        onOpponentTtrChange(opp.id, num);
      }
    });

    ttrGroup.appendChild(ttrLabelEl);
    ttrGroup.appendChild(ttrInput);
    row.appendChild(ttrGroup);

    // Win/Loss select
    const selectGroup = document.createElement("div");
    selectGroup.className = "opponent-select-group";

    const selectLabelEl = document.createElement("label");
    const selectId = `opp-won-${opp.id}`;
    selectLabelEl.htmlFor = selectId;
    selectLabelEl.className = "visually-hidden";
    selectLabelEl.textContent = t("opponent.won-label", { number: rowNum });

    const select = document.createElement("select");
    select.id = selectId;
    select.className = "opponent-won-select";
    select.setAttribute("aria-label", t("opponent.won-label", { number: rowNum }));

    const winOpt = document.createElement("option");
    winOpt.value = "win";
    winOpt.textContent = t("opponent.won-option");

    const lossOpt = document.createElement("option");
    lossOpt.value = "loss";
    lossOpt.textContent = t("opponent.lost-option");

    select.appendChild(winOpt);
    select.appendChild(lossOpt);
    select.value = opp.won ? "win" : "loss";

    select.addEventListener("change", () => {
      onOpponentWonChange(opp.id, select.value === "win");
    });

    selectGroup.appendChild(selectLabelEl);
    selectGroup.appendChild(select);
    row.appendChild(selectGroup);

    // Win expectation (shown only if results exist)
    if (state.results !== null) {
      const winExpEntry = state.results.perOpponent.find((p) => p.id === opp.id);
      const winExpEl = document.createElement("span");
      winExpEl.className = "win-expectation";
      winExpEl.setAttribute(
        "aria-label",
        `${t("result.win-expectation")}: ${winExpEntry ? (winExpEntry.winExpectation * 100).toFixed(0) + "%" : "—"}`,
      );
      winExpEl.textContent = winExpEntry ? `${(winExpEntry.winExpectation * 100).toFixed(0)}%` : "";
      row.appendChild(winExpEl);
    }

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn-delete-opponent";
    delBtn.textContent = "✕";
    delBtn.setAttribute("aria-label", t("opponent.delete-label", { number: rowNum }));
    delBtn.disabled = state.opponents.length <= 1;
    delBtn.addEventListener("click", () => {
      onRemoveOpponent(opp.id);
    });
    row.appendChild(delBtn);

    list.appendChild(row);
  });

  // Update Add Opponent button label
  addBtn.textContent = t("button.add-opponent");
  // Re-wire add button by replacing it (prevents duplicate listeners since we fully re-render)
  const newAddBtn = addBtn.cloneNode(true) as HTMLButtonElement;
  newAddBtn.textContent = t("button.add-opponent");
  newAddBtn.addEventListener("click", onAddOpponent);
  addBtn.replaceWith(newAddBtn);
}

// --------------------------------------------------------------------------
// Calculate button
// --------------------------------------------------------------------------

function renderCalculateButton(state: AppState, container: HTMLElement): void {
  const btn = container.querySelector<HTMLButtonElement>("#btn-calculate");
  if (!btn) return;
  btn.textContent = t("button.calculate");
  btn.disabled = !isCalculationAllowed(state);
}

// --------------------------------------------------------------------------
// Results summary
// --------------------------------------------------------------------------

function renderResults(state: AppState, container: HTMLElement): void {
  const summary = container.querySelector<HTMLElement>("#results-summary");
  const staleNotice = container.querySelector<HTMLElement>("#stale-notice");
  if (!summary || !staleNotice) return;

  if (state.results === null) {
    summary.hidden = true;
    staleNotice.hidden = true;
    staleNotice.textContent = "";
    return;
  }

  summary.hidden = false;

  // Apply or remove stale styling
  if (state.isStale) {
    summary.classList.add("stale");
    staleNotice.hidden = false;
    staleNotice.textContent = t("dialog.stale-aria-live");
  } else {
    summary.classList.remove("stale");
    staleNotice.hidden = true;
    staleNotice.textContent = "";
  }

  const { newTtr, delta, expectedWinsTotal } = state.results;

  const newTtrEl = summary.querySelector<HTMLElement>("#result-new-ttr");
  const deltaEl = summary.querySelector<HTMLElement>("#result-delta");
  const expectedWinsEl = summary.querySelector<HTMLElement>("#result-expected-wins");
  const newTtrLabelEl = summary.querySelector<HTMLElement>("#result-new-ttr-label");
  const deltaLabelEl = summary.querySelector<HTMLElement>("#result-delta-label");
  const expectedWinsLabelEl = summary.querySelector<HTMLElement>("#result-expected-wins-label");

  if (newTtrLabelEl) newTtrLabelEl.textContent = t("result.new-ttr");
  if (deltaLabelEl) deltaLabelEl.textContent = t("result.delta");
  if (expectedWinsLabelEl) expectedWinsLabelEl.textContent = t("result.expected-wins");

  if (newTtrEl) newTtrEl.textContent = String(Math.round(newTtr));
  if (deltaEl) deltaEl.textContent = formatDelta(delta);
  if (expectedWinsEl) expectedWinsEl.textContent = expectedWinsTotal.toFixed(2);
}

// --------------------------------------------------------------------------
// Reset button
// --------------------------------------------------------------------------

function renderResetButton(container: HTMLElement): void {
  const btn = container.querySelector<HTMLButtonElement>("#btn-reset");
  if (!btn) return;
  btn.textContent = t("button.reset");
}

// --------------------------------------------------------------------------
// Page title & static labels
// --------------------------------------------------------------------------

function renderStaticText(container: HTMLElement): void {
  const title = container.querySelector<HTMLHeadingElement>("#app-title");
  if (title) title.textContent = t("app.title");
}

// --------------------------------------------------------------------------
// Main render function
// --------------------------------------------------------------------------

export type RenderCallbacks = {
  onAddOpponent: () => void;
  onRemoveOpponent: (id: string) => void;
  onOpponentTtrChange: (id: string, value: number | null) => void;
  onOpponentWonChange: (id: string, won: boolean) => void;
};

export function render(state: AppState, callbacks: RenderCallbacks): void {
  const container = document.getElementById("app");
  if (!container) return;

  renderStaticText(container);
  renderOwnTtr(state, container);
  renderOpponentList(
    state,
    container,
    callbacks.onAddOpponent,
    callbacks.onRemoveOpponent,
    callbacks.onOpponentTtrChange,
    callbacks.onOpponentWonChange,
  );
  renderCalculateButton(state, container);
  renderResults(state, container);
  renderResetButton(container);
}
