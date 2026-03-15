import { describe, it, expect } from "vitest";

import { calculateResults } from "./calculator";
import { createInitialState } from "./state";
import type { AppState } from "./state";

describe("calculateResults", () => {
  it("returns CalculationResults structure when state has one valid opponent", () => {
    // given
    const state: AppState = {
      ...createInitialState(),
      ownTtr: 1500,
      opponents: [{ id: "1", ttr: 1400, won: true }],
    };

    // when
    const result = calculateResults(state);

    // then
    expect(typeof result.updatedRating).toBe("number");
    expect(typeof result.ratingChange).toBe("number");
    expect(typeof result.expectedNumberWins).toBe("number");
    expect(Array.isArray(result.winExpectations)).toBe(true);
    expect(result.winExpectations).toHaveLength(1);
  });

  it("returns bounded win expectations when state has multiple valid opponents", () => {
    // given
    const state: AppState = {
      ...createInitialState(),
      ownTtr: 1500,
      opponents: [
        { id: "1", ttr: 1400, won: true },
        { id: "2", ttr: 1600, won: false },
      ],
    };

    // when
    const result = calculateResults(state);

    // then
    expect(result.winExpectations).toHaveLength(2);
    for (const we of result.winExpectations) {
      expect(we).toBeGreaterThanOrEqual(0);
      expect(we).toBeLessThanOrEqual(1);
    }
  });

  it("returns numeric updatedRating when player factor flags are set", () => {
    // given
    const state: AppState = {
      ...createInitialState(),
      ownTtr: 1000,
      opponents: [{ id: "1", ttr: 1000, won: true }],
      playerFactors: {
        isYoungerThan21: true,
        isYoungerThan16: true,
        lessThan30SingleGames: false,
        lessThan15GamesOverallOrAfterYearBreak: false,
      },
    };

    // when
    const result = calculateResults(state);

    // then
    expect(typeof result.updatedRating).toBe("number");
  });
});
