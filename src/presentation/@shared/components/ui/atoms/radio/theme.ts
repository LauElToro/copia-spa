import { defaultTheme as globalTheme } from "../../theme.default";

export interface RadioTheme {
  states: {
    default: {
      background: string;
      color: string;
      borderColor: string;
    };
    checked: {
      background: string;
      color: string;
      borderColor: string;
    };
    disabled: {
      background: string;
      color: string;
      borderColor: string;
    };
  };
}

export const defaultTheme: RadioTheme = {
  states: {
    default: {
      background: "transparent",
      color: "#000000",
      borderColor: globalTheme.primary.main,
    },
    checked: {
      background: globalTheme.primary.main,
      color: globalTheme.neutral.white,
      borderColor: globalTheme.primary.main,
    },
    disabled: {
      background: "#f8f9fa",
      color: "#6c757d",
      borderColor: "#dee2e6",
    },
  },
};
