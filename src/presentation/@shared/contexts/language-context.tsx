"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import type { Language, Translations } from "@/presentation/@shared/i18n/types";
import { translations } from "@/presentation/@shared/i18n";

interface LanguageContextProps {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const STORAGE_KEY = "liberty-club-language";

export const LanguageProvider = ({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) => {
  const [language, setLanguageState] = useState<Language>(initialLanguage || "es");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!initialLanguage) {
      const stored = (localStorage.getItem(STORAGE_KEY) as Language) || "es";
      setLanguageState(stored);
    }
    setIsHydrated(true);
  }, [initialLanguage]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, language);
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language, isHydrated]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = useMemo(() => translations[language], [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, t]
  );

  if (!isHydrated) return null;

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
};

