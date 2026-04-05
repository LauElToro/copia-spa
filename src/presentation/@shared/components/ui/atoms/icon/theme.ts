import { ThemeColors, defaultTheme as globalTheme } from "../../theme.default";

export interface IconTheme extends ThemeColors {
  sizes: {
    sm: {
      fontSize: string;
    };
    md: {
      fontSize: string;
    };
    lg: {
      fontSize: string;
    };
    xl: {
      fontSize: string;
    };
  };
  variants: {
    default: {
      color: string;
    };
    primary: {
      color: string;
    };
    secondary: {
      color: string;
    };
    success: {
      color: string;
    };
    danger: {
      color: string;
    };
  };
}

export const defaultTheme: IconTheme = {
  ...globalTheme,
  sizes: {
    sm: {
      fontSize: "0.875rem", // fs-6
    },
    md: {
      fontSize: "1rem", // fs-5
    },
    lg: {
      fontSize: "1.25rem", // fs-4
    },
    xl: {
      fontSize: "1.5rem", // fs-3
    },
  },
  variants: {
    default: {
      color: "inherit",
    },
    primary: {
      color: globalTheme.primary.main,
    },
    secondary: {
      color: globalTheme.secondary.main,
    },
    success: {
      color: globalTheme.success.main,
    },
    danger: {
      color: globalTheme.danger.main,
    },
  },
};
