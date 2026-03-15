import { t } from "./i18n";
import type { AppState } from "./state";

function saveFocus(): { id: string; selectionStart: number | null; selectionEnd: number | null } | null {
  const active = document.activeElement;
  if (active instanceof HTMLElement && active.id) {
    if (active instanceof HTMLInputElement && active.type === "text") {
      return {
        id: active.id,
        selectionStart: active.selectionStart,
        selectionEnd: active.selectionEnd,
      };
    }
    return { id: active.id, selectionStart: null, selectionEnd: null };
  }
  return null;
}

function restoreFocus(saved: { id: string; selectionStart: number | null; selectionEnd: number | null }): void {
  const el = document.getElementById(saved.id);
  if (el === null) {
    return;
  }
  if (el instanceof HTMLInputElement && el.type === "text") {
    el.focus();
    if (saved.selectionStart !== null && saved.selectionEnd !== null) {
      try {
        el.setSelectionRange(saved.selectionStart, saved.selectionEnd);
      } catch {
        // setSelectionRange throws for input types that don't support it (e.g. number)
      }
    } else {
      // For inputs that don't support selectionStart (e.g. type="number"),
      // place cursor at end by re-assigning the value
      const { value } = el;
      el.value = "";
      el.value = value;
    }
  } else {
    el.focus();
  }
}

export function render(state: AppState): void {
  document.title = t("app.title");
  const app = document.getElementById("app");
  if (app !== null) {
    const focusState = saveFocus();
    const isCalculateDisabled =
      state.ownTtr === null || state.opponents.length === 0 || state.opponents.some((o) => o.ttr === null);
    const opponentRowsHtml = state.opponents
      .map(
        (opponent, index) => `
        <div class="opponent-row">
          <label class="opponent-label" for="opponent-ttr-${opponent.id}">${t("opponent.label", { number: index + 1 })}</label>
          <input
            id="opponent-ttr-${opponent.id}"
            name="opponent-ttr-${opponent.id}"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            value="${opponent.ttr === null ? "" : String(opponent.ttr)}"
            data-opponent-id="${opponent.id}"
          />
          <button
            id="opponent-won-${opponent.id}"
            data-opponent-id="${opponent.id}"
            data-won="${opponent.won ? "true" : "false"}"
          >${opponent.won ? t("opponent.won") : t("opponent.lost")}</button>
          ${
            state.opponents.length > 1
              ? `<button class="remove-opponent" data-opponent-id="${opponent.id}" aria-label="${t("button.removeOpponent", { number: index + 1 })}">✕</button>`
              : ""
          }
          ${
            state.results !== null && opponent.id in state.results.winExpectations
              ? `<span class="win-expectation${state.isStale ? " stale" : ""}">${t("result.winExpectation")}: ${(state.results.winExpectations[opponent.id] * 100).toFixed(1)}%</span>`
              : ""
          }
        </div>`,
      )
      .join("");
    app.innerHTML = `
      <section>
        <h1>${t("app.title")}</h1>
        <div class="own-ttr-section">
          <label for="own-ttr">${t("player.ownTtrLabel")}</label>
          <input
            id="own-ttr"
            name="own-ttr"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            value="${state.ownTtr === null ? "" : String(state.ownTtr)}"
          />
        </div>
        <fieldset>
          <legend>${t("playerFactors.legend")}</legend>
          <div>
            <input type="checkbox" id="factor-younger-than-21"${state.playerFactors.isYoungerThan21 ? " checked" : ""} />
            <label for="factor-younger-than-21">${t("playerFactors.youngerThan21Label")}</label>
          </div>
          <div>
            <input type="checkbox" id="factor-younger-than-16"${state.playerFactors.isYoungerThan16 ? " checked" : ""} />
            <label for="factor-younger-than-16">${t("playerFactors.youngerThan16Label")}</label>
          </div>
          <div>
            <input type="checkbox" id="factor-less-than-30-games"${state.playerFactors.lessThan30SingleGames ? " checked" : ""} />
            <label for="factor-less-than-30-games">${t("playerFactors.lessThan30GamesLabel")}</label>
          </div>
          <div>
            <input type="checkbox" id="factor-returnee-less-than-15"${state.playerFactors.lessThan15GamesOverallOrAfterYearBreak ? " checked" : ""} />
            <label for="factor-returnee-less-than-15">${t("playerFactors.returneeLessThan15Label")}</label>
          </div>
        </fieldset>
        <div id="opponent-list">
          ${opponentRowsHtml}
          <button id="add-opponent">${t("button.addOpponent")}</button>
        </div>
        <div class="action-buttons">
          <button id="calculate-button"${isCalculateDisabled ? " disabled" : ""}>${t("button.calculate")}</button>
          <button id="reset-button">${t("button.reset")}</button>
        </div>
        ${state.results !== null && state.isStale ? `<p id="stale-indicator">${t("stale.indicator")}</p>` : ""}
        ${
          state.results !== null
            ? `<div id="summary-block"${state.isStale ? ' class="stale"' : ""}>
          <div class="result-item">
            ${t("result.newTtr")}: <strong class="result-value">${state.results.updatedRating}</strong>
          </div>
          <div class="result-item">
            ${t("result.delta")}: <strong class="result-value">${state.results.ratingChange >= 0 ? "+" : ""}${state.results.ratingChange}</strong>
          </div>
          <div class="result-item">
            ${t("result.expectedWins")}: <strong class="result-value">${state.results.expectedNumberWins.toFixed(2)}</strong>
          </div>
        </div>`
            : ""
        }
      </section>
      <dialog id="reset-dialog" aria-labelledby="reset-dialog-title">
        <h2 id="reset-dialog-title">${t("reset.dialogTitle")}</h2>
        <p id="reset-dialog-message">${t("reset.confirmMessage")}</p>
        <div class="dialog-actions">
          <button id="cancel-reset">${t("reset.cancelButton")}</button>
          <button id="confirm-reset">${t("reset.confirmButton")}</button>
        </div>
      </dialog>
    `;
    if (focusState !== null) {
      restoreFocus(focusState);
    }
  }
}
