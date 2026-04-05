import { ThemeColors, defaultTheme as globalTheme } from "../../theme.default";

export interface LinkTheme extends ThemeColors {
  variants: {
    primary: {
      color: string;
      hover?: {
        color: string;
      };
      fontSize?: string;
    };
    text: {
      color: string;
      hover?: {
        color: string;
      };
      fontSize?: string;
    }
  };
}

export const defaultTheme: LinkTheme = {
  ...globalTheme,
  variants: {
    primary: {
      color: globalTheme.neutral.white,
      hover: {
        color: globalTheme.primary.main,
      },
    },
    text: {
      color: globalTheme.neutral.black,
      hover: {
        color: globalTheme.primary.main,
      },
    },
  },
};
