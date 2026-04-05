import esTranslations from "./translations/es.json";
import enTranslations from "./translations/en.json";
import type { Translations, Language } from "./types";

export const translations: Record<Language, Translations> = {
  es: esTranslations,
  en: enTranslations,
};

export type { Translations, Language };

