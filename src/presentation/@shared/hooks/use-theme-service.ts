/**
 * Hook: useThemeService
 * Hook para acceder al servicio de temas siguiendo DDD
 */
import { useMemo } from 'react';
import { ThemeService } from '../../../application/theme/services/theme.service';
import { ThemeRepositoryImpl } from '../../../infrastructure/theme/repositories/theme-repository-impl';

let themeServiceInstance: ThemeService | null = null;

export function useThemeService(): ThemeService {
  return useMemo(() => {
    if (!themeServiceInstance) {
      const repository = new ThemeRepositoryImpl();
      themeServiceInstance = new ThemeService(repository);
    }
    return themeServiceInstance;
  }, []);
}

