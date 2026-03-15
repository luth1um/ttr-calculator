import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

export async function init(): Promise<void> {
  await i18next
    .use(LanguageDetector)
    .use(Backend)
    .init({
      fallbackLng: "en",
      backend: {
        loadPath: "/ttr-calculator/locales/{{lng}}/translation.json",
      },
    });
}

export function t(key: string, options?: Record<string, unknown>): string {
  const fn = i18next.t.bind(i18next) as (key: string, options?: Record<string, unknown>) => string;
  return fn(key, options);
}
