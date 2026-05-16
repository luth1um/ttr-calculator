import { afterEach, describe, expect, it, vi } from "vitest";

import {
  FALLBACK_LANGUAGE,
  LANGUAGE_ENGLISH,
  LANGUAGE_ENGLISH_GB,
  SUPPORTED_LANGUAGES,
  formatNumber,
  LANGUAGE_FRENCH_FR,
  LANGUAGE_FRENCH,
} from "./i18n";

function stubNavigatorLanguage(language: string | undefined): void {
  vi.stubGlobal("navigator", { language });
}

describe("formatNumber", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("formats using the browser locale when the language is supported", () => {
    // given
    stubNavigatorLanguage(LANGUAGE_ENGLISH);

    // when
    const result = formatNumber(1234.5);

    // then
    expect(result).toBe(new Intl.NumberFormat(LANGUAGE_ENGLISH).format(1234.5));
  });

  it("preserves the regional variant when the primary subtag is supported", () => {
    // given
    stubNavigatorLanguage(LANGUAGE_ENGLISH_GB);

    // when
    const result = formatNumber(1234.5);

    // then
    expect(result).toBe(new Intl.NumberFormat(LANGUAGE_ENGLISH_GB).format(1234.5));
  });

  it("falls back to the fallback language when the browser language is not supported", () => {
    // given
    stubNavigatorLanguage(LANGUAGE_FRENCH_FR);

    // when
    const result = formatNumber(1234.5);

    // then
    expect(result).toBe(new Intl.NumberFormat(FALLBACK_LANGUAGE).format(1234.5));
    expect(result).not.toBe(new Intl.NumberFormat(LANGUAGE_FRENCH_FR).format(1234.5));
  });

  it("falls back when the browser language has only an unsupported primary subtag", () => {
    // given
    stubNavigatorLanguage(LANGUAGE_FRENCH);

    // when
    const result = formatNumber(1234.5);

    // then
    expect(result).toBe(new Intl.NumberFormat(FALLBACK_LANGUAGE).format(1234.5));
  });

  it("falls back when navigator.language is missing", () => {
    // given
    stubNavigatorLanguage(undefined);

    // when
    const result = formatNumber(1234.5);

    // then
    expect(result).toBe(new Intl.NumberFormat(FALLBACK_LANGUAGE).format(1234.5));
  });

  it("falls back when navigator.language is an empty string", () => {
    // given
    stubNavigatorLanguage("");

    // when
    const result = formatNumber(1234.5);

    // then
    expect(result).toBe(new Intl.NumberFormat(FALLBACK_LANGUAGE).format(1234.5));
  });

  it("forwards Intl.NumberFormatOptions to the underlying formatter", () => {
    // given
    stubNavigatorLanguage(LANGUAGE_ENGLISH);
    const options: Intl.NumberFormatOptions = { maximumFractionDigits: 2, minimumFractionDigits: 2 };

    // when
    const result = formatNumber(1.2345, options);

    // then
    expect(result).toBe(new Intl.NumberFormat(LANGUAGE_ENGLISH, options).format(1.2345));
  });
});

describe("SUPPORTED_LANGUAGES", () => {
  it("includes the fallback language", () => {
    // then
    expect(SUPPORTED_LANGUAGES).toContain(FALLBACK_LANGUAGE);
  });
});
