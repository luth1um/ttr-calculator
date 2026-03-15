// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export type OpponentEntry = {
  id: string;
  ttr: number | null;
  won: boolean;
};

export type PerOpponentResult = {
  id: string;
  winExpectation: number;
};

export type CalculationResults = {
  newTtr: number;
  delta: number;
  expectedWinsTotal: number;
  perOpponent: PerOpponentResult[];
};

export type AppState = {
  ownTtr: number | null;
  opponents: OpponentEntry[];
  results: CalculationResults | null;
  isStale: boolean;
};

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function generateId(): string {
  return crypto.randomUUID();
}

function defaultOpponent(): OpponentEntry {
  return { id: generateId(), ttr: 1000, won: true };
}

// --------------------------------------------------------------------------
// Factory
// --------------------------------------------------------------------------

export function initialState(): AppState {
  return {
    ownTtr: null,
    opponents: [defaultOpponent()],
    results: null,
    isStale: false,
  };
}

// --------------------------------------------------------------------------
// Mutations — all return a new AppState (immutable update pattern)
// --------------------------------------------------------------------------

export function setOwnTtr(state: AppState, ttr: number | null): AppState {
  return { ...state, ownTtr: ttr };
}

export function addOpponent(state: AppState): AppState {
  return {
    ...state,
    opponents: [...state.opponents, defaultOpponent()],
  };
}

export function removeOpponent(state: AppState, id: string): AppState {
  if (state.opponents.length <= 1) return state;
  return {
    ...state,
    opponents: state.opponents.filter((o) => o.id !== id),
  };
}

export function setOpponentTtr(state: AppState, id: string, ttr: number | null): AppState {
  return {
    ...state,
    opponents: state.opponents.map((o) => (o.id === id ? { ...o, ttr } : o)),
  };
}

export function setOpponentWon(state: AppState, id: string, won: boolean): AppState {
  return {
    ...state,
    opponents: state.opponents.map((o) => (o.id === id ? { ...o, won } : o)),
  };
}

export function setResults(state: AppState, results: CalculationResults): AppState {
  return { ...state, results, isStale: false };
}

export function markStale(state: AppState): AppState {
  if (state.results === null) return state;
  return { ...state, isStale: true };
}

export function resetSession(state: AppState): AppState {
  return {
    ...state,
    opponents: [defaultOpponent()],
    results: null,
    isStale: false,
  };
}
