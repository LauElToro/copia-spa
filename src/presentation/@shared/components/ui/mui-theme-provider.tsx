import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { defaultTheme } from './theme.default';

// Create MUI theme based on our default theme
const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: defaultTheme.primary.main,
      light: defaultTheme.primary.light,
      dark: defaultTheme.primary.dark,
      contrastText: defaultTheme.primary.contrast,
    },
    secondary: {
      main: defaultTheme.secondary.main,
      light: defaultTheme.secondary.light,
      dark: defaultTheme.secondary.dark,
      contrastText: defaultTheme.secondary.contrast,
    },
    success: {
      main: defaultTheme.success.main,
      light: defaultTheme.success.light,
      dark: defaultTheme.success.dark,
      contrastText: defaultTheme.success.contrast,
    },
    error: {
      main: defaultTheme.danger.main,
      light: defaultTheme.danger.light,
      dark: defaultTheme.danger.dark,
      contrastText: defaultTheme.danger.contrast,
    },
    warning: {
      main: defaultTheme.warning.main,
      light: defaultTheme.warning.light,
      dark: defaultTheme.warning.dark,
      contrastText: defaultTheme.warning.contrast,
    },
    info: {
      main: defaultTheme.info.main,
      light: defaultTheme.info.light,
      dark: defaultTheme.info.dark,
      contrastText: defaultTheme.info.contrast,
    },
    background: {
      default: defaultTheme.neutral.gray900,
      paper: '#1a1a1a',
    },
    text: {
      primary: defaultTheme.neutral.white,
      secondary: defaultTheme.neutral.gray300,
    },
    divider: defaultTheme.border.light,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: defaultTheme.fontSize.title,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: defaultTheme.fontSize.subtitle,
      fontWeight: 'bold',
    },
    body1: {
      fontSize: defaultTheme.fontSize.pharagraph,
    },
  },
  shape: {
    borderRadius: parseInt(defaultTheme.borderRadius.main),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: defaultTheme.primary.main,
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: defaultTheme.primary.light,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: parseInt(defaultTheme.fontWeight.main),
          textTransform: 'none',
          borderRadius: defaultTheme.borderRadius.main,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${defaultTheme.primary.main}30`,
          boxShadow: `0 8px 32px 0 ${defaultTheme.primary.main}20`,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          border: `1px solid ${defaultTheme.primary.main}30`,
          borderRadius: defaultTheme.borderRadius.main,
          '&.Mui-focused': {
            borderColor: `${defaultTheme.primary.main}60`,
          },
        },
      },
    },
  },
});

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export { muiTheme };
export default AppThemeProvider;
