import { describe, it, expect, beforeEach, vi } from "vitest";

import { loadOwnTtr, loadPlayerFactors, saveOwnTtr, savePlayerFactors } from "./storage";

const mockStore: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string): string | null => mockStore[key] ?? null,
  setItem: (key: string, value: string): void => {
    mockStore[key] = value;
  },
  removeItem: (key: string): void => {
    delete mockStore[key];
  },
  clear: (): void => {
    Object.keys(mockStore).forEach((key) => delete mockStore[key]);
  },
};
vi.stubGlobal("localStorage", localStorageMock);

describe("loadOwnTtr", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns 1000 when ownTtr is not present in localStorage", () => {
    // when
    const result = loadOwnTtr();

    // then
    expect(result).toBe(1000);
  });

  it("returns stored number when ownTtr contains a numeric string", () => {
    // given
    localStorage.setItem("ownTtr", "1500");

    // when
    const result = loadOwnTtr();

    // then
    expect(result).toBe(1500);
  });

  it("returns 1000 when ownTtr contains a non-numeric string", () => {
    // given
    localStorage.setItem("ownTtr", "notanumber");

    // when
    const result = loadOwnTtr();

    // then
    expect(result).toBe(1000);
  });

  it("returns 1000 when ownTtr contains an empty string", () => {
    // given
    localStorage.setItem("ownTtr", "");

    // when
    const result = loadOwnTtr();

    // then
    expect(result).toBe(1000);
  });

  it("returns zero when ownTtr contains string zero", () => {
    // given
    localStorage.setItem("ownTtr", "0");

    // when
    const result = loadOwnTtr();

    // then
    expect(result).toBe(0);
  });
});

describe("saveOwnTtr", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists value as string when a numeric ownTtr is provided", () => {
    // when
    saveOwnTtr(1423);

    // then
    expect(localStorage.getItem("ownTtr")).toBe("1423");
  });

  it("removes item when ownTtr is set to null", () => {
    // given
    localStorage.setItem("ownTtr", "1423");

    // when
    saveOwnTtr(null);

    // then
    expect(localStorage.getItem("ownTtr")).toBe(null);
  });
});

describe("loadPlayerFactors", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns all-false defaults when playerFactors is not present in localStorage", () => {
    // when
    const result = loadPlayerFactors();

    // then
    expect(result).toEqual({
      isYoungerThan21: false,
      isYoungerThan16: false,
      lessThan30SingleGames: false,
      lessThan15GamesOverallOrAfterYearBreak: false,
    });
  });

  it("returns stored factors when playerFactors contains valid JSON", () => {
    // given
    const factors = {
      isYoungerThan21: true,
      isYoungerThan16: false,
      lessThan30SingleGames: true,
      lessThan15GamesOverallOrAfterYearBreak: false,
    };
    localStorage.setItem("playerFactors", JSON.stringify(factors));

    // when
    const result = loadPlayerFactors();

    // then
    expect(result).toEqual(factors);
  });

  it("returns all-false defaults when playerFactors contains invalid JSON", () => {
    // given
    localStorage.setItem("playerFactors", "not-json{");

    // when
    const result = loadPlayerFactors();

    // then
    expect(result).toEqual({
      isYoungerThan21: false,
      isYoungerThan16: false,
      lessThan30SingleGames: false,
      lessThan15GamesOverallOrAfterYearBreak: false,
    });
  });

  it("returns all-false defaults when playerFactors contains a non-object JSON value", () => {
    // given
    localStorage.setItem("playerFactors", "null");

    // when
    const result = loadPlayerFactors();

    // then
    expect(result).toEqual({
      isYoungerThan21: false,
      isYoungerThan16: false,
      lessThan30SingleGames: false,
      lessThan15GamesOverallOrAfterYearBreak: false,
    });
  });

  it("returns all-false defaults when playerFactors contains an array", () => {
    // given
    localStorage.setItem("playerFactors", "[]");

    // when
    const result = loadPlayerFactors();

    // then
    expect(result).toEqual({
      isYoungerThan21: false,
      isYoungerThan16: false,
      lessThan30SingleGames: false,
      lessThan15GamesOverallOrAfterYearBreak: false,
    });
  });
});

describe("savePlayerFactors", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists factors as JSON when playerFactors object is provided", () => {
    // given
    const factors = {
      isYoungerThan21: true,
      isYoungerThan16: false,
      lessThan30SingleGames: false,
      lessThan15GamesOverallOrAfterYearBreak: true,
    };

    // when
    savePlayerFactors(factors);

    // then
    expect(localStorage.getItem("playerFactors")).toBe(JSON.stringify(factors));
  });
});
