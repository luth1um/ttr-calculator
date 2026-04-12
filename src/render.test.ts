// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  render,
  updateStaleState,
  updateCalculateButtonState,
  updatePlayerFactorCheckboxes,
  updateOpponentWonButton,
} from "./render";
import { createInitialState, addOpponent } from "./state";
import type { CalculationResults } from "./state";

vi.mock("./i18n", () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      "app.title": "TTR Calculator",
      "player.ownTtrLabel": "Player TTR",
      "playerFactors.youngerThan21Label": "Player is younger than 21",
      "playerFactors.youngerThan16Label": "Player is younger than 16",
      "playerFactors.lessThan30GamesLabel": "Player has fewer than 30 single games overall",
      "playerFactors.returneeLessThan15Label":
        "Player paused for at least one year and has fewer than 15 single games since returning",
    };
    return translations[key] ?? key;
  },
}));

describe("render", () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="app"></main>';
  });

  it("renders labeled own TTR input when ownTtr is null", () => {
    // given
    const state = createInitialState();
    state.ownTtr = null;

    // when
    render(state);

    const label = document.querySelector('label[for="own-ttr"]');
    const input = document.getElementById("own-ttr") as HTMLInputElement | null;

    // then
    expect(document.title).toBe("TTR Calculator");
    expect(label).not.toBeNull();
    expect(label?.textContent).toBe("Player TTR");
    expect(input).not.toBeNull();
    expect(input?.value).toBe("");
  });

  it("renders own TTR value of 1000 when using initial state", () => {
    // given
    const state = createInitialState();

    // when
    render(state);

    // then
    const input = document.getElementById("own-ttr") as HTMLInputElement | null;
    expect(input?.value).toBe("1000");
  });

  it("renders own TTR value when ownTtr is present in state", () => {
    // given
    const state = createInitialState();
    state.ownTtr = 1423;

    // when
    render(state);

    // then
    const input = document.getElementById("own-ttr") as HTMLInputElement | null;
    expect(input?.value).toBe("1423");
  });

  it("restores focus to own TTR input after re-render when it was the active element", () => {
    // given
    const state = createInitialState();
    render(state);
    const input = document.getElementById("own-ttr") as HTMLInputElement;
    input.focus();

    // when
    state.ownTtr = 1500;
    render(state);

    // then
    const restoredInput = document.getElementById("own-ttr") as HTMLInputElement;
    expect(restoredInput.value).toBe("1500");
    expect(document.activeElement).toBe(restoredInput);
  });

  it("renders four unchecked player factor checkboxes with labels when all factors are false", () => {
    // given
    const state = createInitialState();

    // when
    render(state);

    // then
    const ids = [
      "factor-younger-than-21",
      "factor-younger-than-16",
      "factor-less-than-30-games",
      "factor-returnee-less-than-15",
    ];
    for (const id of ids) {
      const checkbox = document.getElementById(id) as HTMLInputElement | null;
      const label = document.querySelector(`label[for="${id}"]`);
      expect(checkbox).not.toBeNull();
      expect(checkbox?.type).toBe("checkbox");
      expect(checkbox?.checked).toBe(false);
      expect(label).not.toBeNull();
    }
  });

  it("renders checked checkboxes when corresponding player factors are true", () => {
    // given
    const state = createInitialState();
    state.playerFactors.isYoungerThan16 = true;
    state.playerFactors.isYoungerThan21 = true;

    // when
    render(state);

    // then
    const cb16 = document.getElementById("factor-younger-than-16") as HTMLInputElement;
    const cb21 = document.getElementById("factor-younger-than-21") as HTMLInputElement;
    expect(cb16.checked).toBe(true);
    expect(cb21.checked).toBe(true);
  });

  it("selects entire opponent TTR input value when focus is restored after re-render", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    render(state);
    const opponentId = state.opponents[0].id;
    const input = document.getElementById(`opponent-ttr-${opponentId}`) as HTMLInputElement;
    input.focus();
    input.setSelectionRange(2, 2); // cursor was after "10" in "1000"

    // when
    render(state);

    // then
    const restoredInput = document.getElementById(`opponent-ttr-${opponentId}`) as HTMLInputElement;
    expect(document.activeElement).toBe(restoredInput);
    expect(restoredInput.selectionStart).toBe(0);
    expect(restoredInput.selectionEnd).toBe(restoredInput.value.length);
  });

  it("selects entire own TTR input value when focus is restored after re-render", () => {
    // given
    const state = createInitialState();
    state.ownTtr = 1500;
    render(state);
    const input = document.getElementById("own-ttr") as HTMLInputElement;
    input.focus();
    input.setSelectionRange(2, 2); // cursor was in the middle of "1500"

    // when
    render(state);

    // then
    const restoredInput = document.getElementById("own-ttr") as HTMLInputElement;
    expect(document.activeElement).toBe(restoredInput);
    expect(restoredInput.selectionStart).toBe(0);
    expect(restoredInput.selectionEnd).toBe(restoredInput.value.length);
  });
});

function makeResults(opponentId: string): CalculationResults {
  return {
    updatedRating: 1050,
    ratingChange: 50,
    expectedNumberWins: 0.5,
    winExpectations: { [opponentId]: 0.5 },
  };
}

describe("updateStaleState", () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="app"></main>';
  });

  it("adds stale class to summary block and inserts stale indicator when state becomes stale", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    state.results = makeResults(state.opponents[0].id);
    state.isStale = false;
    render(state);

    // when
    state.isStale = true;
    updateStaleState(state);

    // then
    expect(document.getElementById("summary-block")?.classList.contains("stale")).toBe(true);
    expect(document.getElementById("stale-indicator")).not.toBeNull();
  });

  it("removes stale class from summary block and removes stale indicator when state is no longer stale", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    state.results = makeResults(state.opponents[0].id);
    state.isStale = true;
    render(state);

    // when
    state.isStale = false;
    updateStaleState(state);

    // then
    expect(document.getElementById("summary-block")?.classList.contains("stale")).toBe(false);
    expect(document.getElementById("stale-indicator")).toBeNull();
  });

  it("does nothing when results are null", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    render(state);

    // when
    state.isStale = true;
    updateStaleState(state);

    // then
    expect(document.getElementById("stale-indicator")).toBeNull();
  });

  it("does not insert a duplicate stale indicator when already stale", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    state.results = makeResults(state.opponents[0].id);
    state.isStale = true;
    render(state);

    // when — call again while still stale
    updateStaleState(state);

    // then
    expect(document.querySelectorAll("#stale-indicator").length).toBe(1);
  });

  it("adds stale class to win-expectation spans", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    state.results = makeResults(state.opponents[0].id);
    state.isStale = false;
    render(state);

    // when
    state.isStale = true;
    updateStaleState(state);

    // then
    const winExpectations = document.querySelectorAll(".win-expectation");
    expect(winExpectations.length).toBeGreaterThan(0);
    for (const el of winExpectations) {
      expect(el.classList.contains("stale")).toBe(true);
    }
  });

  it("removes stale class from win-expectation spans when no longer stale", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    state.results = makeResults(state.opponents[0].id);
    state.isStale = true;
    render(state);

    // when
    state.isStale = false;
    updateStaleState(state);

    // then
    for (const el of document.querySelectorAll(".win-expectation")) {
      expect(el.classList.contains("stale")).toBe(false);
    }
  });
});

describe("updateCalculateButtonState", () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="app"></main>';
  });

  it("disables calculate button when ownTtr is null", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    render(state);

    // when
    state.ownTtr = null;
    updateCalculateButtonState(state);

    // then
    const button = document.getElementById("calculate-button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("enables calculate button when all TTR values are present", () => {
    // given
    const state = createInitialState();
    state.ownTtr = null;
    addOpponent(state);
    render(state);

    // when
    state.ownTtr = 1000;
    updateCalculateButtonState(state);

    // then
    const button = document.getElementById("calculate-button") as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it("disables calculate button when an opponent has null TTR", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    render(state);

    // when
    state.opponents[0].ttr = null;
    updateCalculateButtonState(state);

    // then
    const button = document.getElementById("calculate-button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});

describe("updatePlayerFactorCheckboxes", () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="app"></main>';
  });

  it("checks the younger-than-21 checkbox when state has it true", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    render(state);

    // when
    state.playerFactors.isYoungerThan21 = true;
    updatePlayerFactorCheckboxes(state);

    // then
    const checkbox = document.getElementById("factor-younger-than-21") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it("unchecks the younger-than-21 checkbox when state has it false", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    state.playerFactors.isYoungerThan21 = true;
    render(state);

    // when
    state.playerFactors.isYoungerThan21 = false;
    updatePlayerFactorCheckboxes(state);

    // then
    const checkbox = document.getElementById("factor-younger-than-21") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it("syncs all four checkboxes to their state values simultaneously", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    render(state);

    // when
    state.playerFactors.isYoungerThan21 = true;
    state.playerFactors.isYoungerThan16 = true;
    state.playerFactors.lessThan30SingleGames = false;
    state.playerFactors.lessThan15GamesOverallOrAfterYearBreak = false;
    updatePlayerFactorCheckboxes(state);

    // then
    expect((document.getElementById("factor-younger-than-21") as HTMLInputElement).checked).toBe(true);
    expect((document.getElementById("factor-younger-than-16") as HTMLInputElement).checked).toBe(true);
    expect((document.getElementById("factor-less-than-30-games") as HTMLInputElement).checked).toBe(false);
    expect((document.getElementById("factor-returnee-less-than-15") as HTMLInputElement).checked).toBe(false);
  });
});

describe("updateOpponentWonButton", () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="app"></main>';
  });

  it("updates button text and data-won to false when opponent lost", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    render(state);
    const opponentId = state.opponents[0].id;

    // when
    state.opponents[0].won = false;
    updateOpponentWonButton(state, opponentId);

    // then
    const button = document.getElementById(`opponent-won-${opponentId}`) as HTMLButtonElement;
    expect(button.textContent).toBe("opponent.lost");
    expect(button.dataset["won"]).toBe("false");
  });

  it("updates button text and data-won to true when opponent won", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    state.opponents[0].won = false;
    render(state);
    const opponentId = state.opponents[0].id;

    // when
    state.opponents[0].won = true;
    updateOpponentWonButton(state, opponentId);

    // then
    const button = document.getElementById(`opponent-won-${opponentId}`) as HTMLButtonElement;
    expect(button.textContent).toBe("opponent.won");
    expect(button.dataset["won"]).toBe("true");
  });

  it("does nothing when opponentId is not in state", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    render(state);

    // when / then — should not throw
    expect(() => updateOpponentWonButton(state, "nonexistent-id")).not.toThrow();
  });
});
