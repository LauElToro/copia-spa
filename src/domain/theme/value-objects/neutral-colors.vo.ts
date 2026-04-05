/**
 * Value Object: NeutralColors
 * Representa la paleta de colores neutros del tema
 */
export interface NeutralColorsProps {
  white: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
  black: string;
}

export class NeutralColors {
  constructor(private readonly props: NeutralColorsProps) {
    this.validate();
  }

  get white(): string {
    return this.props.white;
  }

  get gray100(): string {
    return this.props.gray100;
  }

  get gray200(): string {
    return this.props.gray200;
  }

  get gray300(): string {
    return this.props.gray300;
  }

  get gray400(): string {
    return this.props.gray400;
  }

  get gray500(): string {
    return this.props.gray500;
  }

  get gray600(): string {
    return this.props.gray600;
  }

  get gray700(): string {
    return this.props.gray700;
  }

  get gray800(): string {
    return this.props.gray800;
  }

  get gray900(): string {
    return this.props.gray900;
  }

  get black(): string {
    return this.props.black;
  }

  private validate(): void {
    const colors = Object.values(this.props);
    for (const color of colors) {
      if (!this.isValidHexColor(color)) {
        throw new Error(`Invalid neutral color: ${color}`);
      }
    }
  }

  private isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  toObject(): NeutralColorsProps {
    return { ...this.props };
  }
}

