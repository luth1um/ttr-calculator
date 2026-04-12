import { describe, it, expect } from "vitest";

import {
  createInitialState,
  setOwnTtr,
  setPlayerFactor,
  addOpponent,
  removeOpponent,
  setOpponentTtr,
  toggleOpponentWon,
  setResults,
  setStale,
  resetSession,
} from "./state";

describe("createInitialState", () => {
  it("returns correct AppState shape when createInitialState is called", () => {
    // when
    const state = createInitialState();

    // then
    expect(state.ownTtr).toBe(1000);
    expect(state.opponents).toEqual([]);
    expect(state.playerFactors).toEqual({
      isYoungerThan21: false,
      isYoungerThan16: false,
      lessThan30SingleGames: false,
      lessThan15GamesOverallOrAfterYearBreak: false,
    });
    expect(state.results).toBe(null);
    expect(state.isStale).toBe(false);
  });

  it("returns fresh objects when createInitialState is called multiple times", () => {
    // when
    const state1 = createInitialState();
    const state2 = createInitialState();

    // then
    expect(state1).not.toBe(state2);
    expect(state1.opponents).not.toBe(state2.opponents);
  });

  it("returns an empty opponents array when createInitialState is called", () => {
    // when
    const state = createInitialState();

    // then
    expect(Array.isArray(state.opponents)).toBe(true);
    expect(state.opponents.length).toBe(0);
  });
});

describe("setOwnTtr", () => {
  it("updates ownTtr when a numeric value is provided", () => {
    // given
    const state = createInitialState();

    // when
    setOwnTtr(state, 1423);

    // then
    expect(state.ownTtr).toBe(1423);
  });

  it("sets ownTtr to null when the input value is cleared", () => {
    // given
    const state = createInitialState();
    state.ownTtr = 1500;

    // when
    setOwnTtr(state, null);

    // then
    expect(state.ownTtr).toBe(null);
  });

  it("marks results stale when results already exist and ownTtr changes", () => {
    // given
    const state = createInitialState();
    state.results = {
      updatedRating: 1510,
      ratingChange: 10,
      expectedNumberWins: 0.4,
      winExpectations: {},
    };
    state.isStale = false;

    // when
    setOwnTtr(state, 1499);

    // then
    expect(state.isStale).toBe(true);
  });

  it("keeps isStale unchanged when no results exist and ownTtr changes", () => {
    // given
    const state = createInitialState();
    state.isStale = false;

    // when
    setOwnTtr(state, 1499);

    // then
    expect(state.isStale).toBe(false);
  });
});

describe("setPlayerFactor", () => {
  it("sets a single factor to true when that factor is toggled on", () => {
    // given
    const state = createInitialState();

    // when
    setPlayerFactor(state, "lessThan30SingleGames", true);

    // then
    expect(state.playerFactors.lessThan30SingleGames).toBe(true);
  });

  it("sets isYoungerThan21 to true when isYoungerThan16 is set to true", () => {
    // given
    const state = createInitialState();

    // when
    setPlayerFactor(state, "isYoungerThan16", true);

    // then
    expect(state.playerFactors.isYoungerThan16).toBe(true);
    expect(state.playerFactors.isYoungerThan21).toBe(true);
  });

  it("does not affect isYoungerThan16 when isYoungerThan21 is set to false", () => {
    // given
    const state = createInitialState();
    state.playerFactors.isYoungerThan16 = true;
    state.playerFactors.isYoungerThan21 = true;

    // when
    setPlayerFactor(state, "isYoungerThan21", false);

    // then
    expect(state.playerFactors.isYoungerThan21).toBe(false);
    expect(state.playerFactors.isYoungerThan16).toBe(true);
  });

  it("does not affect isYoungerThan21 when isYoungerThan16 is set to false", () => {
    // given
    const state = createInitialState();
    state.playerFactors.isYoungerThan16 = true;
    state.playerFactors.isYoungerThan21 = true;

    // when
    setPlayerFactor(state, "isYoungerThan16", false);

    // then
    expect(state.playerFactors.isYoungerThan16).toBe(false);
    expect(state.playerFactors.isYoungerThan21).toBe(true);
  });

  it("sets isStale to true when a factor changes and results exist", () => {
    // given
    const state = createInitialState();
    state.results = {
      updatedRating: 1510,
      ratingChange: 10,
      expectedNumberWins: 0.4,
      winExpectations: {},
    };
    state.isStale = false;

    // when
    setPlayerFactor(state, "lessThan30SingleGames", true);

    // then
    expect(state.isStale).toBe(true);
  });

  it("does not set isStale when a factor changes and results are null", () => {
    // given
    const state = createInitialState();
    state.isStale = false;

    // when
    setPlayerFactor(state, "lessThan30SingleGames", true);

    // then
    expect(state.isStale).toBe(false);
  });
});

describe("addOpponent", () => {
  it("increases opponents array length by 1 when addOpponent is called", () => {
    // given
    const state = createInitialState();

    // when
    addOpponent(state);

    // then
    expect(state.opponents.length).toBe(1);
  });

  it("adds opponent with ttr 1000 and won true when addOpponent is called", () => {
    // given
    const state = createInitialState();

    // when
    addOpponent(state);

    // then
    expect(state.opponents[0]?.ttr).toBe(1000);
    expect(state.opponents[0]?.won).toBe(true);
  });

  it("assigns a unique id different from existing opponents when addOpponent is called twice", () => {
    // given
    const state = createInitialState();

    // when
    addOpponent(state);
    addOpponent(state);

    // then
    expect(state.opponents[0]?.id).not.toBe(state.opponents[1]?.id);
  });

  it("sets isStale to true when addOpponent is called and results exist", () => {
    // given
    const state = createInitialState();
    state.results = {
      updatedRating: 1510,
      ratingChange: 10,
      expectedNumberWins: 0.4,
      winExpectations: {},
    };
    state.isStale = false;

    // when
    addOpponent(state);

    // then
    expect(state.isStale).toBe(true);
  });

  it("does not set isStale when addOpponent is called and results are null", () => {
    // given
    const state = createInitialState();
    state.isStale = false;

    // when
    addOpponent(state);

    // then
    expect(state.isStale).toBe(false);
  });
});

describe("removeOpponent", () => {
  it("reduces opponents array length by 1 when a valid id is removed", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    addOpponent(state);
    const idToRemove = state.opponents[0]!.id;

    // when
    removeOpponent(state, idToRemove);

    // then
    expect(state.opponents.length).toBe(1);
  });

  it("removes the correct opponent when removeOpponent is called with an id", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    addOpponent(state);
    const idToRemove = state.opponents[0]!.id;
    const idToKeep = state.opponents[1]!.id;

    // when
    removeOpponent(state, idToRemove);

    // then
    expect(state.opponents[0]?.id).toBe(idToKeep);
    expect(state.opponents.find((o) => o.id === idToRemove)).toBeUndefined();
  });

  it("has no effect when removeOpponent is called and only one opponent exists", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    const id = state.opponents[0]!.id;

    // when
    removeOpponent(state, id);

    // then
    expect(state.opponents.length).toBe(1);
  });

  it("sets isStale to true when removeOpponent is called and results exist", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    addOpponent(state);
    state.results = {
      updatedRating: 1510,
      ratingChange: 10,
      expectedNumberWins: 0.4,
      winExpectations: {},
    };
    state.isStale = false;
    const idToRemove = state.opponents[0]!.id;

    // when
    removeOpponent(state, idToRemove);

    // then
    expect(state.isStale).toBe(true);
  });

  it("does not set isStale when removeOpponent is called and results are null", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    addOpponent(state);
    state.isStale = false;
    const idToRemove = state.opponents[0]!.id;

    // when
    removeOpponent(state, idToRemove);

    // then
    expect(state.isStale).toBe(false);
  });
});

describe("setOpponentTtr", () => {
  it("sets opponent.ttr to the provided numeric value when a valid number is given", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    const id = state.opponents[0]!.id;

    // when
    setOpponentTtr(state, id, 1500);

    // then
    expect(state.opponents[0]?.ttr).toBe(1500);
  });

  it("sets opponent.ttr to null when null is provided", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    const id = state.opponents[0]!.id;

    // when
    setOpponentTtr(state, id, null);

    // then
    expect(state.opponents[0]?.ttr).toBe(null);
  });

  it("does nothing when the opponent id is not found", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    const originalTtr = state.opponents[0]!.ttr;

    // when
    setOpponentTtr(state, "nonexistent-id", 999);

    // then
    expect(state.opponents[0]?.ttr).toBe(originalTtr);
    expect(state.opponents.length).toBe(1);
  });

  it("sets isStale to true when results exist and ttr is changed", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    const id = state.opponents[0]!.id;
    state.results = {
      updatedRating: 1510,
      ratingChange: 10,
      expectedNumberWins: 0.4,
      winExpectations: {},
    };
    state.isStale = false;

    // when
    setOpponentTtr(state, id, 1600);

    // then
    expect(state.isStale).toBe(true);
  });

  it("does not set isStale when results are null and ttr is changed", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    const id = state.opponents[0]!.id;
    state.isStale = false;

    // when
    setOpponentTtr(state, id, 1600);

    // then
    expect(state.isStale).toBe(false);
  });
});

describe("toggleOpponentWon", () => {
  it("flips won from true to false when opponent has won = true", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    const id = state.opponents[0]!.id;
    state.opponents[0]!.won = true;

    // when
    toggleOpponentWon(state, id);

    // then
    expect(state.opponents[0]?.won).toBe(false);
  });

  it("flips won from false to true when opponent has won = false", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    const id = state.opponents[0]!.id;
    state.opponents[0]!.won = false;

    // when
    toggleOpponentWon(state, id);

    // then
    expect(state.opponents[0]?.won).toBe(true);
  });

  it("does nothing when the opponent id is not found", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    const originalWon = state.opponents[0]!.won;

    // when
    toggleOpponentWon(state, "nonexistent-id");

    // then
    expect(state.opponents[0]?.won).toBe(originalWon);
  });

  it("sets isStale to true when results exist and won is toggled", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    const id = state.opponents[0]!.id;
    state.results = {
      updatedRating: 1510,
      ratingChange: 10,
      expectedNumberWins: 0.4,
      winExpectations: {},
    };
    state.isStale = false;

    // when
    toggleOpponentWon(state, id);

    // then
    expect(state.isStale).toBe(true);
  });

  it("does not set isStale when results are null and won is toggled", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    const id = state.opponents[0]!.id;
    state.isStale = false;

    // when
    toggleOpponentWon(state, id);

    // then
    expect(state.isStale).toBe(false);
  });
});

describe("setResults", () => {
  it("sets state.results to the provided CalculationResults object", () => {
    // given
    const state = createInitialState();
    const results = {
      updatedRating: 1510,
      ratingChange: 10,
      expectedNumberWins: 0.6,
      winExpectations: {},
    };

    // when
    setResults(state, results);

    // then
    expect(state.results).toBe(results);
  });

  it("sets isStale to false when results are set", () => {
    // given
    const state = createInitialState();
    state.isStale = true;
    const results = {
      updatedRating: 1510,
      ratingChange: 10,
      expectedNumberWins: 0.6,
      winExpectations: {},
    };

    // when
    setResults(state, results);

    // then
    expect(state.isStale).toBe(false);
  });

  it("sets state.results to null when null is provided", () => {
    // given
    const state = createInitialState();
    state.results = {
      updatedRating: 1510,
      ratingChange: 10,
      expectedNumberWins: 0.6,
      winExpectations: {},
    };

    // when
    setResults(state, null);

    // then
    expect(state.results).toBe(null);
  });

  it("sets isStale to false even when isStale was previously true", () => {
    // given
    const state = createInitialState();
    state.isStale = true;

    // when
    setResults(state, null);

    // then
    expect(state.isStale).toBe(false);
  });
});

describe("setStale", () => {
  it("sets isStale to true when true is provided", () => {
    // given
    const state = createInitialState();
    state.isStale = false;

    // when
    setStale(state, true);

    // then
    expect(state.isStale).toBe(true);
  });

  it("sets isStale to false when false is provided", () => {
    // given
    const state = createInitialState();
    state.isStale = true;

    // when
    setStale(state, false);

    // then
    expect(state.isStale).toBe(false);
  });
});

describe("resetSession", () => {
  it("resets opponents to exactly one entry with ttr 1000 and won true when called", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    addOpponent(state);
    addOpponent(state);

    // when
    resetSession(state);

    // then
    expect(state.opponents.length).toBe(1);
    expect(state.opponents[0]?.ttr).toBe(1000);
    expect(state.opponents[0]?.won).toBe(true);
  });

  it("sets results to null when resetSession is called", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    state.results = {
      updatedRating: 1510,
      ratingChange: 10,
      expectedNumberWins: 0.4,
      winExpectations: {},
    };

    // when
    resetSession(state);

    // then
    expect(state.results).toBe(null);
  });

  it("sets isStale to false even when it was previously true", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    state.isStale = true;

    // when
    resetSession(state);

    // then
    expect(state.isStale).toBe(false);
  });

  it("preserves ownTtr value when resetSession is called", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    state.ownTtr = 1423;

    // when
    resetSession(state);

    // then
    expect(state.ownTtr).toBe(1423);
  });

  it("preserves playerFactors values when resetSession is called", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    state.playerFactors.isYoungerThan21 = true;
    state.playerFactors.lessThan30SingleGames = true;

    // when
    resetSession(state);

    // then
    expect(state.playerFactors.isYoungerThan21).toBe(true);
    expect(state.playerFactors.lessThan30SingleGames).toBe(true);
    expect(state.playerFactors.isYoungerThan16).toBe(false);
    expect(state.playerFactors.lessThan15GamesOverallOrAfterYearBreak).toBe(false);
  });

  it("generates a unique id when a new default opponent is created", () => {
    // given
    const state = createInitialState();
    addOpponent(state);
    const previousId = state.opponents[0]!.id;

    // when
    resetSession(state);

    // then
    expect(state.opponents[0]?.id).toBeDefined();
    expect(state.opponents[0]?.id).not.toBe(previousId);
  });
});
