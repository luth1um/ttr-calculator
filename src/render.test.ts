// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

import { render } from "./render";
import { createInitialState, addOpponent } from "./state";

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

  it("preserves cursor position in opponent TTR input when it is re-rendered", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    render(state);
    const opponentId = state.opponents[0].id;
    const input = document.getElementById(`opponent-ttr-${opponentId}`) as HTMLInputElement;
    input.focus();
    input.setSelectionRange(2, 2); // cursor after "10" in "1000"

    // when
    render(state);

    // then
    const restoredInput = document.getElementById(`opponent-ttr-${opponentId}`) as HTMLInputElement;
    expect(document.activeElement).toBe(restoredInput);
    expect(restoredInput.selectionStart).toBe(2);
    expect(restoredInput.selectionEnd).toBe(2);
  });
});
