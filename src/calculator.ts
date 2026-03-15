import { calculateTTRatingMultipeOpponents } from "ttr-calculator-typescript";
import type { AppState, CalculationResults } from "./state";

export function calculateResults(state: AppState): CalculationResults {
  const ownTtr = state.ownTtr ?? 0;
  const games = state.opponents.map((o) => ({
    opponentTTRating: o.ttr ?? 0,
    gameWasWon: o.won,
  }));

  const result = calculateTTRatingMultipeOpponents({ ttRating: ownTtr }, games);

  const perOpponent = state.opponents.map((o, i) => ({
    id: o.id,
    winExpectation: result.winExpectations[i] ?? 0,
  }));

  return {
    newTtr: result.updatedRating,
    delta: result.ratingChange,
    expectedWinsTotal: result.expectedNumberWins,
    perOpponent,
  };
}
