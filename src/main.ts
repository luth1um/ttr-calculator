import { calculateResults } from "./calculator";
import { KEYBOARD_KEYS } from "./constants.ts";
import { init } from "./i18n";
import {
  render,
  updateStaleState,
  updateCalculateButtonState,
  updatePlayerFactorCheckboxes,
  updateOpponentWonButton,
} from "./render";
import {
  createInitialState,
  setOwnTtr,
  setPlayerFactor,
  addOpponent,
  removeOpponent,
  setOpponentTtr,
  toggleOpponentWon,
  setResults,
  resetSession,
  type PlayerFactors,
} from "./state";
import { loadOwnTtr, loadPlayerFactors, saveOwnTtr, savePlayerFactors } from "./storage";

function parseOwnTtrInput(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function parseOpponentTtrInput(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return null;
  }
  return Math.max(0, num);
}

const CHECKBOX_TO_FACTOR: Record<string, keyof PlayerFactors> = {
  "factor-younger-than-21": "isYoungerThan21",
  "factor-younger-than-16": "isYoungerThan16",
  "factor-less-than-30-games": "lessThan30SingleGames",
  "factor-returnee-less-than-15": "lessThan15GamesOverallOrAfterYearBreak",
};

export function sanitizeDigitInput(value: string, selectionStart: number | null): { value: string; cursor: number } {
  const sanitized = value.replace(/\D/g, "");
  const pos = selectionStart ?? value.length;
  const cursor = value.slice(0, pos).replace(/\D/g, "").length;
  return { value: sanitized, cursor };
}

async function main(): Promise<void> {
  await init();

  const state = createInitialState();
  state.ownTtr = loadOwnTtr();
  state.playerFactors = loadPlayerFactors();
  addOpponent(state);

  render(state);

  const app = document.getElementById("app");
  app?.addEventListener("focusin", (event) => {
    const target = event.target;
    if (
      target instanceof HTMLInputElement &&
      target.type === "text" &&
      (target.id === "own-ttr" || target.id.startsWith("opponent-ttr-"))
    ) {
      requestAnimationFrame(() => {
        if (document.activeElement === target) {
          target.select();
        }
      });
    }
  });

  app?.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== "text") {
      return;
    }

    const sanitized = sanitizeDigitInput(target.value, target.selectionStart);
    if (sanitized.value !== target.value) {
      target.value = sanitized.value;
      target.setSelectionRange(sanitized.cursor, sanitized.cursor);
    }

    if (target.id === "own-ttr") {
      const parsedValue = parseOwnTtrInput(target.value);
      setOwnTtr(state, parsedValue);
      saveOwnTtr(state.ownTtr);
      updateStaleState(state);
      updateCalculateButtonState(state);
      return;
    }
    const opponentId = target.dataset["opponentId"];
    if (opponentId !== undefined && target.id.startsWith("opponent-ttr-")) {
      const parsedValue = parseOpponentTtrInput(target.value);
      setOpponentTtr(state, opponentId, parsedValue);
      updateStaleState(state);
      updateCalculateButtonState(state);
    }
  });

  app?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    const factorKey = CHECKBOX_TO_FACTOR[target.id];
    if (factorKey === undefined) {
      return;
    }
    setPlayerFactor(state, factorKey, target.checked);
    savePlayerFactors(state.playerFactors);
    updatePlayerFactorCheckboxes(state);
    updateStaleState(state);
  });

  app?.addEventListener("keydown", (event) => {
    const target = event.target;
    if (event.key === KEYBOARD_KEYS.ENTER && target instanceof HTMLInputElement && target.type === "checkbox") {
      event.preventDefault();
      target.checked = !target.checked;
      target.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });

  app?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (target.id === "add-opponent") {
      addOpponent(state);
      render(state);
      return;
    }
    if (target.classList.contains("remove-opponent")) {
      const opponentId = target.dataset["opponentId"];
      if (opponentId !== undefined) {
        removeOpponent(state, opponentId);
        render(state);
      }
      return;
    }
    if (target.id.startsWith("opponent-won-")) {
      const opponentId = target.dataset["opponentId"];
      if (opponentId !== undefined) {
        toggleOpponentWon(state, opponentId);
        updateOpponentWonButton(state, opponentId);
        updateStaleState(state);
      }
    }
    if (target.id === "calculate-button") {
      if (state.ownTtr !== null && state.opponents.length > 0 && state.opponents.every((o) => o.ttr !== null)) {
        const rawResults = calculateResults(state);
        const winExpectations: Record<string, number> = {};
        state.opponents.forEach((opp, i) => {
          winExpectations[opp.id] = rawResults.winExpectations[i];
        });
        setResults(state, { ...rawResults, winExpectations });
        render(state);
      }
    }
    if (target.id === "reset-button") {
      const dialog = document.getElementById("reset-dialog");
      if (dialog instanceof HTMLDialogElement) {
        dialog.showModal();
      }
      return;
    }
    if (target.id === "confirm-reset") {
      resetSession(state);
      render(state);
      return;
    }
    if (target.id === "cancel-reset") {
      const dialog = document.getElementById("reset-dialog");
      if (dialog instanceof HTMLDialogElement) {
        dialog.close();
      }
      return;
    }
  });
}

void main();
