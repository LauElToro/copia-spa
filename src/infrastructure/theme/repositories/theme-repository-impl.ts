/**
 * Repository Implementation: ThemeRepositoryImpl
 * Implementación del repositorio de temas usando localStorage
 */
import { ThemeRepositoryWithSetTheme } from '../../../domain/theme/repositories/theme-repository';
import { ThemeEntity } from '../../../domain/theme/entities/theme.entity';
import { ThemeModeEntity, ThemeMode } from '../../../domain/theme/entities/theme-mode.entity';
import { DefaultThemeFactory } from '../factories/default-theme.factory';

const THEME_MODE_STORAGE_KEY = 'themeMode';

export class ThemeRepositoryImpl implements ThemeRepositoryWithSetTheme {
  private currentTheme: ThemeEntity;

  constructor() {
    const defaultMode = ThemeMode.DARK;
    this.currentTheme = DefaultThemeFactory.create(defaultMode);
  }

  getCurrentTheme(): ThemeEntity {
    return this.currentTheme;
  }

  getCurrentMode(): ThemeModeEntity {
    return this.currentTheme.mode;
  }

  async saveMode(mode: ThemeModeEntity): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, mode.value);
      this.currentTheme = this.currentTheme.withMode(mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  }

  /**
   * Actualiza el tema actual
   */
  setTheme(theme: ThemeEntity): void {
    this.currentTheme = theme;
  }

  async loadMode(): Promise<ThemeModeEntity | null> {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(THEME_MODE_STORAGE_KEY) as ThemeMode | null;
      if (stored && Object.values(ThemeMode).includes(stored)) {
        return new ThemeModeEntity(stored);
      }
      return null;
    } catch (error) {
      console.error('Error loading theme mode:', error);
      return null;
    }
  }
}

