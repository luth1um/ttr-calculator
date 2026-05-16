import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

declare const __BUILD_TIMESTAMP__: string;

export const LANGUAGE_ENGLISH = "en";
export const LANGUAGE_ENGLISH_GB = LANGUAGE_ENGLISH + "-GB";
export const LANGUAGE_FRENCH = "fr";
export const LANGUAGE_FRENCH_FR = LANGUAGE_FRENCH + "-FR";
export const LANGUAGE_GERMAN = "de";
export const LANGUAGE_GERMAN_DE = LANGUAGE_GERMAN + "-DE";

export const FALLBACK_LANGUAGE = LANGUAGE_ENGLISH;
export const SUPPORTED_LANGUAGES: readonly string[] = [LANGUAGE_ENGLISH, LANGUAGE_GERMAN];

export async function init(): Promise<void> {
  await i18next
    .use(LanguageDetector)
    .use(Backend)
    .init({
      fallbackLng: FALLBACK_LANGUAGE,
      load: "languageOnly",
      backend: {
        loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/translation.json`,
        queryStringParams: { v: __BUILD_TIMESTAMP__ },
      },
    });
  if (typeof document !== "undefined") {
    document.documentElement.lang = i18next.resolvedLanguage ?? FALLBACK_LANGUAGE;
    document.title = i18next.t("app.title");
  }
}

export function t(key: string, options?: Record<string, unknown>): string {
  const fn = i18next.t.bind(i18next) as (key: string, options?: Record<string, unknown>) => string;
  return fn(key, options);
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(resolveDisplayLocale(), options).format(value);
}

function resolveDisplayLocale(): string {
  const browserLocale =
    typeof navigator !== "undefined" && typeof navigator.language === "string" ? navigator.language : "";
  if (!browserLocale) {
    return FALLBACK_LANGUAGE;
  }
  const primarySubtag = browserLocale.split("-")[0].toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(primarySubtag)) {
    return browserLocale;
  }
  return FALLBACK_LANGUAGE;
}
