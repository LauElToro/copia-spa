/**
 * Repository Interface: ThemeRepository
 * Define el contrato para el repositorio de temas
 */
import { ThemeEntity } from '../entities/theme.entity';
import { ThemeModeEntity } from '../entities/theme-mode.entity';

export interface ThemeRepository {
  /**
   * Obtiene el tema actual
   */
  getCurrentTheme(): ThemeEntity;

  /**
   * Obtiene el modo de tema actual
   */
  getCurrentMode(): ThemeModeEntity;

  /**
   * Guarda el modo de tema
   */
  saveMode(mode: ThemeModeEntity): Promise<void>;

  /**
   * Carga el modo de tema guardado
   */
  loadMode(): Promise<ThemeModeEntity | null>;
}

/**
 * Interfaz extendida para repositorios que soportan setTheme
 */
export interface ThemeRepositoryWithSetTheme extends ThemeRepository {
  /**
   * Actualiza el tema actual
   */
  setTheme(theme: ThemeEntity): void;
}

