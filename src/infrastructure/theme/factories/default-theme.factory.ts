/**
 * Factory: DefaultThemeFactory
 * Crea el tema por defecto del sistema
 */
import { ThemeEntity } from '../../../domain/theme/entities/theme.entity';
import { ThemeModeEntity, ThemeMode } from '../../../domain/theme/entities/theme-mode.entity';
import { ColorPalette } from '../../../domain/theme/value-objects/color-palette.vo';
import { NeutralColors } from '../../../domain/theme/value-objects/neutral-colors.vo';

export class DefaultThemeFactory {
  static create(mode: ThemeMode = ThemeMode.DARK): ThemeEntity {
    const modeEntity = new ThemeModeEntity(mode);

    return new ThemeEntity({
      mode: modeEntity,
      palette: {
        primary: new ColorPalette({
          main: '#29C480',
          light: '#3d8bfd',
          dark: '#0D0F12',
          contrast: '#ffffff',
        }),
        secondary: new ColorPalette({
          main: '#6c757d',
          light: '#8c959f',
          dark: '#5c636a',
          contrast: '#ffffff',
        }),
        success: new ColorPalette({
          main: '#198754',
          light: '#2ea043',
          dark: '#157347',
          contrast: '#ffffff',
        }),
        danger: new ColorPalette({
          main: '#E43A3A',
          light: '#e4606d',
          dark: '#bb2d3b',
          contrast: '#ffffff',
        }),
        warning: new ColorPalette({
          main: '#ffc107',
          light: '#ffcd39',
          dark: '#cc9a06',
          contrast: '#000000',
        }),
        info: new ColorPalette({
          main: '#0dcaf0',
          light: '#3dd5f3',
          dark: '#0aa2c0',
          contrast: '#000000',
        }),
        neutral: new NeutralColors({
          white: '#ffffff',
          gray100: '#f8f9fa',
          gray200: '#e9ecef',
          gray300: '#dee2e6',
          gray400: '#ced4da',
          gray500: '#adb5bd',
          gray600: '#6c757d',
          gray700: '#495057',
          gray800: '#343a40',
          gray900: '#212529',
          black: '#000000',
        }),
      },
      spacing: {
        sm: '4px',
        main: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      typography: {
        fontFamily: [
          'Geist',
          'Geist Fallback',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        fontSize: {
          h1: '30px',
          h2: '25px',
          h3: '1.5rem',
          h4: '1.25rem',
          h5: '1.125rem',
          h6: '1rem',
          body1: '1rem',
          body2: '0.875rem',
          caption: '0.75rem',
        },
        fontWeight: {
          light: 300,
          regular: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
      },
      shape: {
        borderRadius: {
          sm: '3px',
          main: '5px',
          md: '8px',
          lg: '12px',
          xl: '16px',
        },
      },
    });
  }
}

