/**
 * Adapter: MuiThemeAdapter
 * Adapta el ThemeEntity del dominio a un tema de MUI
 */
import { Theme as MuiTheme, createTheme } from '@mui/material/styles';
import { ThemeEntity } from '../../../domain/theme/entities/theme.entity';

export class MuiThemeAdapter {
  /**
   * Convierte un ThemeEntity del dominio a un tema de MUI
   */
  static toMuiTheme(themeEntity: ThemeEntity): MuiTheme {
    const { palette, typography, shape, spacing, mode } = themeEntity;

    return createTheme({
      palette: {
        mode: mode.isDark() ? 'dark' : 'light',
        primary: {
          main: palette.primary.main,
          light: palette.primary.light,
          dark: palette.primary.dark,
          contrastText: palette.primary.contrast,
        },
        secondary: {
          main: palette.secondary.main,
          light: palette.secondary.light,
          dark: palette.secondary.dark,
          contrastText: palette.secondary.contrast,
        },
        success: {
          main: palette.success.main,
          light: palette.success.light,
          dark: palette.success.dark,
          contrastText: palette.success.contrast,
        },
        error: {
          main: palette.danger.main,
          light: palette.danger.light,
          dark: palette.danger.dark,
          contrastText: palette.danger.contrast,
        },
        warning: {
          main: palette.warning.main,
          light: palette.warning.light,
          dark: palette.warning.dark,
          contrastText: palette.warning.contrast,
        },
        info: {
          main: palette.info.main,
          light: palette.info.light,
          dark: palette.info.dark,
          contrastText: palette.info.contrast,
        },
        background: {
          default: themeEntity.getBackgroundColor(),
          paper: themeEntity.getPaperColor(),
        },
        text: {
          primary: themeEntity.getTextColor(),
          secondary: mode.isDark() ? palette.neutral.gray400 : palette.neutral.gray600,
        },
      },
      typography: {
        fontFamily: typography.fontFamily.join(','),
        h1: {
          fontSize: typography.fontSize.h1,
          fontWeight: typography.fontWeight.bold,
        },
        h2: {
          fontSize: typography.fontSize.h2,
          fontWeight: typography.fontWeight.bold,
        },
        h3: {
          fontSize: typography.fontSize.h3,
          fontWeight: typography.fontWeight.semibold,
        },
        h4: {
          fontSize: typography.fontSize.h4,
          fontWeight: typography.fontWeight.semibold,
        },
        h5: {
          fontSize: typography.fontSize.h5,
          fontWeight: typography.fontWeight.semibold,
        },
        h6: {
          fontSize: typography.fontSize.h6,
          fontWeight: typography.fontWeight.semibold,
        },
        body1: {
          fontSize: typography.fontSize.body1,
          fontWeight: typography.fontWeight.regular,
        },
        body2: {
          fontSize: typography.fontSize.body2,
          fontWeight: typography.fontWeight.regular,
        },
        caption: {
          fontSize: typography.fontSize.caption,
          fontWeight: typography.fontWeight.regular,
        },
      },
      shape: {
        borderRadius: parseInt(shape.borderRadius.main, 10),
      },
      spacing: (factor: number) => {
        const spacingMap: Record<number, string> = {
          0.5: spacing.sm,
          1: spacing.main,
          2: spacing.md,
          3: spacing.lg,
          4: spacing.xl,
        };
        return spacingMap[factor] || `${factor * 8}px`;
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: shape.borderRadius.main,
              textTransform: 'none',
              fontWeight: typography.fontWeight.bold,
              padding: `${spacing.main} ${spacing.md}`,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: shape.borderRadius.md,
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: shape.borderRadius.main,
              },
            },
          },
        },
      },
    });
  }
}

