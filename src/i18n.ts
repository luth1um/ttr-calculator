import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

export async function init(): Promise<void> {
  await i18next
    .use(HttpBackend)
    .use(LanguageDetector)
    .init({
      fallbackLng: "en",
      supportedLngs: ["en", "de"],
      ns: ["translation"],
      defaultNS: "translation",
      backend: {
        loadPath: "/ttr-calculator/locales/{{lng}}/{{ns}}.json",
      },
      detection: {
        order: ["navigator"],
        caches: [],
      },
      interpolation: {
        escapeValue: false,
      },
    });
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18next.t(key, options);
}
