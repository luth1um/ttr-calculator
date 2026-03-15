import { describe, it, expect } from "vitest";
import {
  initialState,
  addOpponent,
  removeOpponent,
  setOpponentTtr,
  setOpponentWon,
  setOwnTtr,
  setResults,
  markStale,
  resetSession,
  type AppState,
  type CalculationResults,
} from "./state";

// --------------------------------------------------------------------------
// initialState()
// --------------------------------------------------------------------------

describe("initialState", () => {
  it("returns expected shape", () => {
    const s = initialState();
    expect(s.ownTtr).toBeNull();
    expect(s.results).toBeNull();
    expect(s.isStale).toBe(false);
    expect(s.opponents).toHaveLength(1);
    const [opp] = s.opponents;
    expect(opp.ttr).toBe(1000);
    expect(opp.won).toBe(true);
    expect(typeof opp.id).toBe("string");
    expect(opp.id.length).toBeGreaterThan(0);
  });

  it("generates unique ids across calls", () => {
    const a = initialState();
    const b = initialState();
    expect(a.opponents[0].id).not.toBe(b.opponents[0].id);
  });
});

// --------------------------------------------------------------------------
// setOwnTtr
// --------------------------------------------------------------------------

describe("setOwnTtr", () => {
  it("sets ownTtr to a number", () => {
    const s = setOwnTtr(initialState(), 1500);
    expect(s.ownTtr).toBe(1500);
  });

  it("sets ownTtr to null", () => {
    const s = setOwnTtr(initialState(), null);
    expect(s.ownTtr).toBeNull();
  });

  it("does not mutate original state", () => {
    const original = initialState();
    setOwnTtr(original, 1234);
    expect(original.ownTtr).toBeNull();
  });
});

// --------------------------------------------------------------------------
// addOpponent
// --------------------------------------------------------------------------

describe("addOpponent", () => {
  it("appends a new opponent with correct defaults", () => {
    const s = addOpponent(initialState());
    expect(s.opponents).toHaveLength(2);
    const newOpp = s.opponents[1];
    expect(newOpp.ttr).toBe(1000);
    expect(newOpp.won).toBe(true);
  });

  it("generates unique id for new opponent", () => {
    const s = addOpponent(initialState());
    expect(s.opponents[0].id).not.toBe(s.opponents[1].id);
  });

  it("does not mutate original state", () => {
    const original = initialState();
    addOpponent(original);
    expect(original.opponents).toHaveLength(1);
  });
});

// --------------------------------------------------------------------------
// removeOpponent
// --------------------------------------------------------------------------

describe("removeOpponent", () => {
  it("removes the opponent with the given id", () => {
    const s1 = addOpponent(initialState());
    const idToRemove = s1.opponents[0].id;
    const s2 = removeOpponent(s1, idToRemove);
    expect(s2.opponents).toHaveLength(1);
    expect(s2.opponents[0].id).not.toBe(idToRemove);
  });

  it("does nothing when only one opponent remains", () => {
    const s = initialState();
    const result = removeOpponent(s, s.opponents[0].id);
    expect(result.opponents).toHaveLength(1);
  });
});

// --------------------------------------------------------------------------
// setOpponentTtr
// --------------------------------------------------------------------------

describe("setOpponentTtr", () => {
  it("updates ttr for the correct opponent", () => {
    const s1 = addOpponent(initialState());
    const id = s1.opponents[0].id;
    const s2 = setOpponentTtr(s1, id, 1423);
    expect(s2.opponents[0].ttr).toBe(1423);
    expect(s2.opponents[1].ttr).toBe(1000);
  });

  it("accepts null for empty/invalid ttr", () => {
    const s = initialState();
    const id = s.opponents[0].id;
    const result = setOpponentTtr(s, id, null);
    expect(result.opponents[0].ttr).toBeNull();
  });
});

// --------------------------------------------------------------------------
// setOpponentWon
// --------------------------------------------------------------------------

describe("setOpponentWon", () => {
  it("toggles won from true to false", () => {
    const s = initialState();
    const id = s.opponents[0].id;
    const result = setOpponentWon(s, id, false);
    expect(result.opponents[0].won).toBe(false);
  });

  it("toggles won from false to true", () => {
    const s = initialState();
    const id = s.opponents[0].id;
    const s2 = setOpponentWon(s, id, false);
    const s3 = setOpponentWon(s2, id, true);
    expect(s3.opponents[0].won).toBe(true);
  });
});

// --------------------------------------------------------------------------
// setResults
// --------------------------------------------------------------------------

describe("setResults", () => {
  const mockResults: CalculationResults = {
    newTtr: 1435,
    delta: 12,
    expectedWinsTotal: 2.3,
    perOpponent: [],
  };

  it("sets results and clears isStale", () => {
    const stale: AppState = { ...initialState(), isStale: true };
    const s = setResults(stale, mockResults);
    expect(s.results).toEqual(mockResults);
    expect(s.isStale).toBe(false);
  });
});

// --------------------------------------------------------------------------
// markStale
// --------------------------------------------------------------------------

describe("markStale", () => {
  it("sets isStale to true when results exist", () => {
    const mockResults: CalculationResults = {
      newTtr: 1435,
      delta: 12,
      expectedWinsTotal: 2.3,
      perOpponent: [],
    };
    const s = setResults(initialState(), mockResults);
    const stale = markStale(s);
    expect(stale.isStale).toBe(true);
  });

  it("does not set isStale when results are null", () => {
    const s = markStale(initialState());
    expect(s.isStale).toBe(false);
  });
});

// --------------------------------------------------------------------------
// resetSession
// --------------------------------------------------------------------------

describe("resetSession", () => {
  it("resets opponents to one default entry", () => {
    const s1 = addOpponent(addOpponent(initialState()));
    const reset = resetSession(s1);
    expect(reset.opponents).toHaveLength(1);
    expect(reset.opponents[0].ttr).toBe(1000);
    expect(reset.opponents[0].won).toBe(true);
  });

  it("clears results and isStale", () => {
    const mockResults: CalculationResults = {
      newTtr: 1435,
      delta: 12,
      expectedWinsTotal: 2,
      perOpponent: [],
    };
    const s = markStale(setResults(initialState(), mockResults));
    const reset = resetSession(s);
    expect(reset.results).toBeNull();
    expect(reset.isStale).toBe(false);
  });

  it("preserves ownTtr", () => {
    const s = setOwnTtr(initialState(), 1423);
    const reset = resetSession(s);
    expect(reset.ownTtr).toBe(1423);
  });

  it("generates a new unique id for the default opponent", () => {
    const s = initialState();
    const originalId = s.opponents[0].id;
    const reset = resetSession(s);
    expect(reset.opponents[0].id).not.toBe(originalId);
  });
});
