'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useThemeMode } from '../contexts/theme-mode-context';
import { useThemeService } from '../hooks/use-theme-service';
import { MuiThemeAdapter } from '../../../infrastructure/theme/adapters/mui-theme.adapter';
import { ThemeMode } from '../../../domain/theme/entities/theme-mode.entity';
import type { ThemeEntity } from '../../../domain/theme/entities/theme.entity';

export function MuiThemeProvider({ children }: { readonly children: React.ReactNode }) {
  const { mode } = useThemeMode();
  const themeService = useThemeService();
  const [themeEntity, setThemeEntity] = useState<ThemeEntity | null>(null);

  // Inicializar el tema al montar
  useEffect(() => {
    const initializeTheme = async () => {
      const theme = await themeService.initializeTheme();
      setThemeEntity(theme);
    };
    initializeTheme();
  }, [themeService]);

  // Sincronizar cambios de modo
  useEffect(() => {
    const updateTheme = async () => {
      if (themeEntity && themeEntity.mode.value !== mode) {
        const updatedTheme = await themeService.setMode(mode as ThemeMode);
        setThemeEntity(updatedTheme);
      }
    };
    updateTheme();
  }, [mode, themeService, themeEntity]);

  const muiTheme = useMemo(() => {
    if (!themeEntity) {
      // Tema temporal mientras se carga
      const tempTheme = themeService.getCurrentTheme();
      return MuiThemeAdapter.toMuiTheme(tempTheme);
    }
    return MuiThemeAdapter.toMuiTheme(themeEntity);
  }, [themeEntity, themeService]);

  if (!themeEntity) {
    // Renderizar con tema temporal mientras se inicializa
    const tempTheme = themeService.getCurrentTheme();
    const tempMuiTheme = MuiThemeAdapter.toMuiTheme(tempTheme);
    return (
      <ThemeProvider theme={tempMuiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

