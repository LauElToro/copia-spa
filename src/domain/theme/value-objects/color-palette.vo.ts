/**
 * Value Object: ColorPalette
 * Representa una paleta de colores del tema
 */
export interface ColorPaletteProps {
  main: string;
  light: string;
  dark: string;
  contrast: string;
}

export class ColorPalette {
  constructor(private readonly props: ColorPaletteProps) {
    this.validate();
  }

  get main(): string {
    return this.props.main;
  }

  get light(): string {
    return this.props.light;
  }

  get dark(): string {
    return this.props.dark;
  }

  get contrast(): string {
    return this.props.contrast;
  }

  private validate(): void {
    if (!this.isValidHexColor(this.props.main)) {
      throw new Error(`Invalid main color: ${this.props.main}`);
    }
    if (!this.isValidHexColor(this.props.light)) {
      throw new Error(`Invalid light color: ${this.props.light}`);
    }
    if (!this.isValidHexColor(this.props.dark)) {
      throw new Error(`Invalid dark color: ${this.props.dark}`);
    }
    if (!this.isValidHexColor(this.props.contrast)) {
      throw new Error(`Invalid contrast color: ${this.props.contrast}`);
    }
  }

  private isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  toObject(): ColorPaletteProps {
    return { ...this.props };
  }
}

