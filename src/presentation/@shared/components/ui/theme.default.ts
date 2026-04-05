export interface ThemeColors {
  // Primary colors
  primary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  // Secondary colors
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  // Success colors
  success: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  // Danger colors
  danger: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  // Warning colors
  warning: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  // Info colors
  info: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  // Neutral colors
  neutral: {
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
  };
  // Border colors
  border: {
    light: string;
    main: string;
    dark: string;
    danger: string,
  };
  // Border radius
  borderRadius: {
    sm: string,
    main: string,
    md: string,
    none: string,
  };
  borderWidth: {
    main: string,
    none: string,
  };
  fontWeight: {
    main: string,
  };
  // Focus colors
  focus: {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
  };
  fontSize: {
    title: string;
    subtitle: string;
    pharagraph: string;
  };
  buttonWidth: {
    main: string;
  };
  borderTopLeftRadius: {
    sm: string;
    main: string;
    md: string;
    none: string;
  };
  borderTopRightRadius: {
    sm: string;
    main: string;
    md: string;
    none: string;
  };
  borderBottomLeftRadius: {
    sm: string;
    main: string;
    md: string;
    none: string;
  };
  borderBottomRightRadius: {
    sm: string;
    main: string;
    md: string;
    none: string;
  };
}

export const defaultTheme: ThemeColors = {
  primary: {
    main: "#29C480",
    light: "#3d8bfd",
    dark: "#0D0F12",
    contrast: "#ffffff",
  },
  secondary: {
    main: "#6c757d",
    light: "#8c959f",
    dark: "#5c636a",
    contrast: "#ffffff",
  },
  success: {
    main: "#198754",
    light: "#2ea043",
    dark: "#157347",
    contrast: "#ffffff",
  },
  danger: {
    main: "#E43A3A",
    light: "#e4606d",
    dark: "#bb2d3b",
    contrast: "#ffffff",
  },
  warning: {
    main: "#ffc107",
    light: "#ffcd39",
    dark: "#cc9a06",
    contrast: "#000000",
  },
  info: {
    main: "#0dcaf0",
    light: "#3dd5f3",
    dark: "#0aa2c0",
    contrast: "#000000",
  },
  neutral: {
    white: "#ffffff",
    gray100: "#f8f9fa",
    gray200: "#e9ecef",
    gray300: "#dee2e6",
    gray400: "#ced4da",
    gray500: "#adb5bd",
    gray600: "#6c757d",
    gray700: "#495057",
    gray800: "#343a40",
    gray900: "#212529",
    black: "#000000",
  },
  border: {
    main: "#6c757d",
    light: "#dee2e6",
    dark: "#adb5bd",
    danger: "#E43A3A",
  },
  borderRadius: {
    sm: "3px",
    main: "5px",
    md: "8px",
    none: "0",
  },
  borderTopLeftRadius: {
    sm: "3px",
    main: "5px",
    md: "8px",
    none: "0",
  },
  borderTopRightRadius: {
    sm: "3px",
    main: "5px",
    md: "8px",
    none: "0",
  },
  borderBottomLeftRadius: {
    sm: "3px",
    main: "5px",
    md: "8px",
    none: "0",
  },
  borderBottomRightRadius: {
    sm: "3px",
    main: "5px",
    md: "8px",
    none: "0",
  },
  borderWidth: {
    main: "1px",
    none: "0",
  },
  fontWeight: {
    main: "700",
  },
  focus: {
    primary: "0 0 0 0.25rem rgba(13, 110, 253, 0.25)",
    secondary: "0 0 0 0.25rem rgba(108, 117, 125, 0.25)",
    success: "0 0 0 0.25rem rgba(25, 135, 84, 0.25)",
    danger: "0 0 0 0.25rem rgba(220, 53, 69, 0.25)",
    warning: "0 0 0 0.25rem rgba(255, 193, 7, 0.25)",
    info: "0 0 0 0.25rem rgba(13, 202, 240, 0.25)",
  },
  fontSize: {
      title: "30px",
      subtitle: "25px",
      pharagraph: "40px",
  },
  buttonWidth: {
    main: "fit-content",
  }

};
