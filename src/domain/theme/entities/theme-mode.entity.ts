/**
 * Domain Entity: ThemeMode
 * Representa el modo de tema (light/dark) como una entidad del dominio
 */
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
}

export class ThemeModeEntity {
  constructor(private readonly _value: ThemeMode) {
    this.validate();
  }

  get value(): ThemeMode {
    return this._value;
  }

  private validate(): void {
    if (!Object.values(ThemeMode).includes(this._value)) {
      throw new Error(`Invalid theme mode: ${this._value}`);
    }
  }

  isLight(): boolean {
    return this._value === ThemeMode.LIGHT;
  }

  isDark(): boolean {
    return this._value === ThemeMode.DARK;
  }

  toggle(): ThemeModeEntity {
    return new ThemeModeEntity(
      this._value === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT
    );
  }

  equals(other: ThemeModeEntity): boolean {
    return this._value === other._value;
  }
}

