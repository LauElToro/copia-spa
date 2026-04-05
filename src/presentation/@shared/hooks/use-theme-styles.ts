import { useThemeMode, ThemeMode } from "@/presentation/@shared/contexts/theme-mode-context";
import { useEffect } from "react";

export function useTheme<TTheme extends { variants: Record<ThemeMode, unknown> }>(
  theme: TTheme
) {
  const { mode, toggleMode, setMode } = useThemeMode();
  useEffect(() => {
    if (globalThis.window !== undefined) {
      localStorage.setItem("themeMode", mode);
      document.body.classList.remove("theme-dark", "theme-light");
      document.body.classList.add(`theme-${mode}`);
    }
  }, [mode]);
  const styles = theme.variants[mode];
  return { mode, toggleMode, setMode, styles };
}