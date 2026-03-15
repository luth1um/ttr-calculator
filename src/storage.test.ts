import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveOwnTtr, loadOwnTtr } from "./storage";

// Provide a predictable in-memory localStorage for the storage module under test.
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

vi.stubGlobal("localStorage", mockLocalStorage);

describe("storage", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it("saves a number and retrieves it", () => {
    saveOwnTtr(1423);
    expect(localStorage.getItem("ownTtr")).toBe("1423");
    expect(loadOwnTtr()).toBe(1423);
  });

  it("returns null when key is absent", () => {
    expect(loadOwnTtr()).toBeNull();
  });

  it("returns null for a non-numeric stored value", () => {
    localStorage.setItem("ownTtr", "not-a-number");
    expect(loadOwnTtr()).toBeNull();
  });

  it("returns null for an empty string value", () => {
    localStorage.setItem("ownTtr", "");
    expect(loadOwnTtr()).toBeNull();
  });

  it("correctly handles zero as a valid TTR value", () => {
    saveOwnTtr(0);
    expect(loadOwnTtr()).toBe(0);
  });
});
