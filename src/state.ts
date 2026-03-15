export type PlayerFactors = {
  isYoungerThan21: boolean;
  isYoungerThan16: boolean;
  lessThan30SingleGames: boolean;
  lessThan15GamesOverallOrAfterYearBreak: boolean;
};

export type OpponentEntry = {
  id: string;
  ttr: number | null;
  won: boolean;
};

export type CalculationResults = {
  updatedRating: number;
  ratingChange: number;
  expectedNumberWins: number;
  winExpectations: Record<string, number>;
};

export type AppState = {
  ownTtr: number | null;
  opponents: OpponentEntry[];
  playerFactors: PlayerFactors;
  results: CalculationResults | null;
  isStale: boolean;
};

export function createInitialState(): AppState {
  return {
    ownTtr: null,
    opponents: [],
    playerFactors: {
      isYoungerThan21: false,
      isYoungerThan16: false,
      lessThan30SingleGames: false,
      lessThan15GamesOverallOrAfterYearBreak: false,
    },
    results: null,
    isStale: false,
  };
}

let nextId = 0;
function generateId(): string {
  return String(nextId++);
}

export function setOwnTtr(state: AppState, value: number | null): void {
  state.ownTtr = value;
  if (state.results !== null) {
    state.isStale = true;
  }
}

export function addOpponent(state: AppState): void {
  state.opponents.push({ id: generateId(), ttr: 1000, won: true });
  if (state.results !== null) {
    state.isStale = true;
  }
}

export function removeOpponent(state: AppState, id: string): void {
  if (state.opponents.length <= 1) {
    return;
  }
  state.opponents = state.opponents.filter((o) => o.id !== id);
  if (state.results !== null) {
    state.isStale = true;
  }
}

export function setOpponentTtr(state: AppState, id: string, value: number | null): void {
  const opponent = state.opponents.find((o) => o.id === id);
  if (opponent === undefined) {
    return;
  }
  opponent.ttr = value;
  if (state.results !== null) {
    state.isStale = true;
  }
}

export function toggleOpponentWon(state: AppState, id: string): void {
  const opponent = state.opponents.find((o) => o.id === id);
  if (opponent === undefined) {
    return;
  }
  opponent.won = !opponent.won;
  if (state.results !== null) {
    state.isStale = true;
  }
}

export function setPlayerFactor(state: AppState, factor: keyof PlayerFactors, value: boolean): void {
  state.playerFactors[factor] = value;
  if (factor === "isYoungerThan16" && value === true) {
    state.playerFactors.isYoungerThan21 = true;
  }
  if (state.results !== null) {
    state.isStale = true;
  }
}

export function setResults(state: AppState, results: CalculationResults | null): void {
  state.results = results;
  state.isStale = false;
}

export function setStale(state: AppState, stale: boolean): void {
  state.isStale = stale;
}

export function resetSession(state: AppState): void {
  state.opponents = [{ id: generateId(), ttr: 1000, won: true }];
  state.results = null;
  state.isStale = false;
}
