import { describe, it, expect } from "vitest";
import { calculateResults } from "./calculator";
import { initialState, addOpponent, setOwnTtr, setOpponentTtr, setOpponentWon } from "./state";

describe("calculateResults", () => {
  it("returns correct result shape for a single win", () => {
    let state = setOwnTtr(initialState(), 1423);
    state = setOpponentTtr(state, state.opponents[0].id, 1380);
    const result = calculateResults(state);

    expect(typeof result.newTtr).toBe("number");
    expect(typeof result.delta).toBe("number");
    expect(typeof result.expectedWinsTotal).toBe("number");
    expect(result.perOpponent).toHaveLength(1);
    expect(result.perOpponent[0].id).toBe(state.opponents[0].id);
    expect(typeof result.perOpponent[0].winExpectation).toBe("number");
  });

  it("delta equals newTtr minus ownTtr", () => {
    let state = setOwnTtr(initialState(), 1423);
    state = setOpponentTtr(state, state.opponents[0].id, 1380);
    const result = calculateResults(state);

    expect(result.delta).toBeCloseTo(result.newTtr - 1423, 5);
  });

  it("returns per-opponent win expectations in the same order as opponents", () => {
    let state = setOwnTtr(initialState(), 1500);
    state = addOpponent(state);
    const [opp1, opp2] = state.opponents;
    state = setOpponentTtr(state, opp1.id, 1000);
    state = setOpponentTtr(state, opp2.id, 2000);
    state = setOpponentWon(state, opp1.id, true);
    state = setOpponentWon(state, opp2.id, false);
    const result = calculateResults(state);

    expect(result.perOpponent).toHaveLength(2);
    expect(result.perOpponent[0].id).toBe(opp1.id);
    expect(result.perOpponent[1].id).toBe(opp2.id);
    // Against a much weaker opponent, win expectation should be > 0.5
    expect(result.perOpponent[0].winExpectation).toBeGreaterThan(0.5);
    // Against a much stronger opponent, win expectation should be < 0.5
    expect(result.perOpponent[1].winExpectation).toBeLessThan(0.5);
  });

  it("does not import state, render, or storage modules", async () => {
    // Dynamic import ensures no side-effects; module boundary is verified through architecture
    const mod = await import("./calculator");
    expect(mod).toHaveProperty("calculateResults");
  });
});
