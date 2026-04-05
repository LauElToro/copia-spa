"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from "react";
import { useThemeService } from "../hooks/use-theme-service";
import { ThemeMode as DomainThemeMode } from "../../../domain/theme/entities/theme-mode.entity";

export type ThemeMode = "light" | "dark";

interface ThemeModeContextProps {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextProps | undefined>(undefined);

export const ThemeModeProvider = ({
  children,
  initialMode}: {
  children: ReactNode;
  initialMode?: ThemeMode;
}) => {
  const themeService = useThemeService();
  const [mode, setMode] = useState<ThemeMode>(initialMode || "dark");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const initializeMode = async () => {
      if (!initialMode) {
        const theme = await themeService.initializeTheme();
        const currentMode = theme.mode.value as ThemeMode;
        setMode(currentMode);
      }
      setIsHydrated(true);
    };
    initializeMode();
  }, [initialMode, themeService]);

  useEffect(() => {
    if (!isHydrated) return;
    
    // Actualizar clases del body
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(`theme-${mode}`);
    
    // Sincronizar con el servicio de temas
    themeService.setMode(mode as DomainThemeMode).catch(console.error);
  }, [mode, isHydrated, themeService]);

  const toggleMode = useCallback(async () => {
    const newTheme = await themeService.toggleMode();
    setMode(newTheme.mode.value as ThemeMode);
  }, [themeService]);

  const handleSetMode = useCallback(async (newMode: ThemeMode) => {
    await themeService.setMode(newMode as DomainThemeMode);
    setMode(newMode);
  }, [themeService]);

  const value = useMemo(() => ({ mode, toggleMode, setMode: handleSetMode }), [mode, toggleMode, handleSetMode]);

  if (!isHydrated) return null;

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used within a ThemeModeProvider");
  return ctx;
};
