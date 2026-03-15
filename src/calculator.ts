import { calculateTTRatingMultipeOpponents } from "ttr-calculator-typescript";
import type { TTPlayer, TTGame } from "ttr-calculator-typescript";

type PlayerFactors = {
  isYoungerThan21: boolean;
  isYoungerThan16: boolean;
  lessThan30SingleGames: boolean;
  lessThan15GamesOverallOrAfterYearBreak: boolean;
};

type OpponentEntry = {
  ttr: number | null;
  won: boolean;
};

type AppState = {
  ownTtr: number | null;
  opponents: OpponentEntry[];
  playerFactors: PlayerFactors;
};

type CalculationResults = {
  updatedRating: number;
  ratingChange: number;
  expectedNumberWins: number;
  winExpectations: number[];
};

export function calculateResults(state: AppState): CalculationResults {
  const ttPlayer: TTPlayer = {
    ttRating: state.ownTtr!,
    isYoungerThan21: state.playerFactors.isYoungerThan21,
    isYoungerThan16: state.playerFactors.isYoungerThan16,
    lessThan30SingleGames: state.playerFactors.lessThan30SingleGames,
    lessThan15SingleGamesOverallOrAfterYearBreak: state.playerFactors.lessThan15GamesOverallOrAfterYearBreak,
  };

  const playedGames: TTGame[] = state.opponents.map((opp) => ({
    opponentTTRating: opp.ttr!,
    gameWasWon: opp.won,
  }));

  const result = calculateTTRatingMultipeOpponents(ttPlayer, playedGames);

  return {
    updatedRating: result.updatedRating,
    ratingChange: result.ratingChange,
    expectedNumberWins: result.expectedNumberWins,
    winExpectations: result.winExpectations,
  };
}
