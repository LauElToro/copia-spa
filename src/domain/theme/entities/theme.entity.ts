/**
 * Domain Entity: Theme
 * Representa un tema completo del sistema
 */
import { ColorPalette } from '../value-objects/color-palette.vo';
import { NeutralColors } from '../value-objects/neutral-colors.vo';
import { ThemeModeEntity } from './theme-mode.entity';

export interface ThemeSpacing {
  sm: string;
  main: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeTypography {
  fontFamily: string[];
  fontSize: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    h6: string;
    body1: string;
    body2: string;
    caption: string;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export interface ThemeShape {
  borderRadius: ThemeSpacing;
}

export interface ThemeProps {
  mode: ThemeModeEntity;
  palette: {
    primary: ColorPalette;
    secondary: ColorPalette;
    success: ColorPalette;
    danger: ColorPalette;
    warning: ColorPalette;
    info: ColorPalette;
    neutral: NeutralColors;
  };
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  shape: ThemeShape;
}

export class ThemeEntity {
  constructor(private readonly props: ThemeProps) {
    this.validate();
  }

  get mode(): ThemeModeEntity {
    return this.props.mode;
  }

  get palette() {
    return this.props.palette;
  }

  get spacing() {
    return this.props.spacing;
  }

  get typography() {
    return this.props.typography;
  }

  get shape() {
    return this.props.shape;
  }

  private validate(): void {
    if (!this.props.mode) {
      throw new Error('Theme mode is required');
    }
    if (!this.props.palette) {
      throw new Error('Theme palette is required');
    }
  }

  /**
   * Crea un nuevo tema con el modo cambiado
   */
  withMode(mode: ThemeModeEntity): ThemeEntity {
    return new ThemeEntity({
      ...this.props,
      mode,
    });
  }

  /**
   * Obtiene el color de fondo según el modo
   */
  getBackgroundColor(): string {
    return this.props.mode.isDark()
      ? this.props.palette.neutral.gray900
      : this.props.palette.neutral.white;
  }

  /**
   * Obtiene el color de texto según el modo
   */
  getTextColor(): string {
    return this.props.mode.isDark()
      ? this.props.palette.neutral.white
      : this.props.palette.neutral.black;
  }

  /**
   * Obtiene el color de papel (para cards, etc.) según el modo
   */
  getPaperColor(): string {
    return this.props.mode.isDark()
      ? this.props.palette.neutral.gray800
      : this.props.palette.neutral.gray100;
  }
}

