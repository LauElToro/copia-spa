/**
 * Application Service: ThemeService
 * Orquesta la lógica de negocio relacionada con temas
 */
import { ThemeRepository, ThemeRepositoryWithSetTheme } from '../../../domain/theme/repositories/theme-repository';
import { ThemeEntity } from '../../../domain/theme/entities/theme.entity';
import { ThemeModeEntity, ThemeMode } from '../../../domain/theme/entities/theme-mode.entity';
import { DefaultThemeFactory } from '../../../infrastructure/theme/factories/default-theme.factory';

export class ThemeService {
  constructor(private readonly themeRepository: ThemeRepository) {}

  /**
   * Obtiene el tema actual
   */
  getCurrentTheme(): ThemeEntity {
    return this.themeRepository.getCurrentTheme();
  }

  /**
   * Obtiene el modo de tema actual
   */
  getCurrentMode(): ThemeModeEntity {
    return this.themeRepository.getCurrentMode();
  }

  /**
   * Cambia el modo de tema
   */
  async setMode(mode: ThemeMode): Promise<ThemeEntity> {
    const modeEntity = new ThemeModeEntity(mode);
    const currentTheme = this.themeRepository.getCurrentTheme();
    const updatedTheme = currentTheme.withMode(modeEntity);
    
    await this.themeRepository.saveMode(modeEntity);
    
    // Actualizar el tema en el repositorio
    if ('setTheme' in this.themeRepository) {
      (this.themeRepository as ThemeRepositoryWithSetTheme).setTheme(updatedTheme);
    }
    
    return updatedTheme;
  }

  /**
   * Alterna entre modo claro y oscuro
   */
  async toggleMode(): Promise<ThemeEntity> {
    const currentMode = this.themeRepository.getCurrentMode();
    const newMode = currentMode.toggle();
    
    const currentTheme = this.themeRepository.getCurrentTheme();
    const updatedTheme = currentTheme.withMode(newMode);
    
    await this.themeRepository.saveMode(newMode);
    
    // Actualizar el tema en el repositorio
    if ('setTheme' in this.themeRepository) {
      (this.themeRepository as ThemeRepositoryWithSetTheme).setTheme(updatedTheme);
    }
    
    return updatedTheme;
  }

  /**
   * Inicializa el tema cargando el modo guardado o usando el por defecto
   */
  async initializeTheme(): Promise<ThemeEntity> {
    const savedMode = await this.themeRepository.loadMode();
    const mode = savedMode || new ThemeModeEntity(ThemeMode.DARK);
    
    const theme = DefaultThemeFactory.create(mode.value);
    return theme;
  }
}

