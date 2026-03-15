import { describe, it, expect } from "vitest";

import { sanitizeDigitInput } from "./main";

describe("sanitizeDigitInput", () => {
  it("returns the value unchanged when it contains only digits", () => {
    // when
    const result = sanitizeDigitInput("1234", 4);

    // then
    expect(result).toEqual({ value: "1234", cursor: 4 });
  });

  it("strips non-digit characters and does not clear the whole input when a non-digit is added", () => {
    // when
    const result = sanitizeDigitInput("1a234", 2);

    // then
    expect(result.value).toBe("1234");
  });

  it("adjusts cursor position correctly when a non-digit is removed before it", () => {
    // when
    const result = sanitizeDigitInput("12a3", 3);

    // then
    expect(result).toEqual({ value: "123", cursor: 2 });
  });

  it("adjusts cursor position correctly when no non-digits precede the cursor", () => {
    // when
    const result = sanitizeDigitInput("12a3", 2);

    // then
    expect(result).toEqual({ value: "123", cursor: 2 });
  });

  it("places cursor at end when selectionStart is null", () => {
    // when
    const result = sanitizeDigitInput("1a2", null);

    // then
    expect(result).toEqual({ value: "12", cursor: 2 });
  });

  it("returns empty string for an all-non-digit value without clearing digits", () => {
    // when
    const result = sanitizeDigitInput("abc", 1);

    // then
    expect(result).toEqual({ value: "", cursor: 0 });
  });

  it("handles an empty string", () => {
    // when
    const result = sanitizeDigitInput("", 0);

    // then
    expect(result).toEqual({ value: "", cursor: 0 });
  });
});
