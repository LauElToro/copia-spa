import { ThemeColors, defaultTheme as globalTheme } from "../../theme.default";

export interface ButtonTheme extends ThemeColors {
  variants: {
    primary: {
      background: string;
      color: string;
      borderColor: string;
      hoverBackground?: string;
      hoverColor?: string;
      borderRadius?: string;
      fontWeight?: string;
      hoverColorBorder: string,
      width: string,
      backgroundImage?: string;
      boxShadow?: string;
      hoverBackgroundImage?: string;
      hoverBoxShadow?: string;
      textShadow?: string;
      transition?: string;
      fontSize?: string;
      padding?: string;
    };
    secondary: {
      background: string;
      color: string;
      borderColor: string;
      hoverBackground?: string;
      hoverColor?: string;
      borderRadius?: string;
      fontWeight?: string;
      hoverColorBorder: string,
      width: string,
      backgroundImage?: string;
      boxShadow?: string;
      hoverBackgroundImage?: string;
      hoverBoxShadow?: string;
      textShadow?: string;
      transition?: string;
      fontSize?: string;
      padding?: string;
    };
    success: {
      background: string;
      color: string;
      borderColor: string;
      hoverBackground?: string;
      hoverColor?: string;
      borderRadius?: string;
      fontWeight?: string;
      hoverColorBorder: string,
      width: string,
      backgroundImage?: string;
      boxShadow?: string;
      hoverBackgroundImage?: string;
      hoverBoxShadow?: string;
      textShadow?: string;
      transition?: string;
      fontSize?: string;
      padding?: string;
    };
    danger: {
      background: string;
      color: string;
      borderColor: string;
      hoverBackground?: string;
      hoverColor?: string;
      borderRadius?: string;
      fontWeight?: string;
      hoverColorBorder: string,
      width: string,
      backgroundImage?: string;
      boxShadow?: string;
      hoverBackgroundImage?: string;
      hoverBoxShadow?: string;
      textShadow?: string;
      transition?: string;
      fontSize?: string;
      padding?: string;
    };
  };
}

export const defaultTheme: ButtonTheme = {
  ...globalTheme,
  variants: {
     primary: {
      background: "#29C480",
      color: "#1e293b",
      borderColor: "#29C480",
      borderRadius: "8px",
      fontWeight: "600",
      hoverColorBorder: "#29C480",
      width: globalTheme.buttonWidth.main,
      backgroundImage: "unset",
      boxShadow: "unset",
      hoverBackground: "#ffffff",
      hoverColor: "#000000",
      hoverBackgroundImage: "unset",
      hoverBoxShadow: "unset",
      textShadow: "unset",
      transition: "background-color 0.3s ease, color 0.3s ease",
      fontSize: "1rem",
      padding: "12px 32px",
    },
    secondary: {
      background: globalTheme.secondary.main,
      color: globalTheme.neutral.white,
      borderColor: globalTheme.secondary.main,
      hoverBackground: globalTheme.secondary.dark,
      hoverColor: globalTheme.neutral.white,
      borderRadius: globalTheme.borderRadius.main,
      fontWeight: globalTheme.fontWeight.main,
      hoverColorBorder: globalTheme.neutral.black,
      width: globalTheme.buttonWidth.main,
      textShadow: "0 2px 4px rgba(0,0,0,0.18)",
      transition: "unset",
      fontSize: "var(--text-p-size)",
    },
    success: {
      background: "#43e97b",
      color: "#fff",
      borderColor: "#43e97b",
      borderRadius: "30px",
      fontWeight: "bold",
      hoverColorBorder: globalTheme.neutral.black,
      width: globalTheme.buttonWidth.main,
      backgroundImage: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
      boxShadow: "0 8px 32px 0 rgba(67, 233, 123, 0.25), 0 1.5px 8px 0 rgba(56, 249, 215, 0.15)",
      hoverBackground: "#38f9d7",
      hoverColor: "#fff",
      hoverBackgroundImage: "linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)",
      hoverBoxShadow: "0 8px 32px 0 rgba(56, 249, 215, 0.35), 0 1.5px 8px 0 rgba(67, 233, 123, 0.25)",
      textShadow: "0 2px 8px rgba(0,0,0,0.35), 0 1px 0 rgba(0,0,0,0.25)",
      transition: "unset",
      fontSize: "var(--text-p-size)",
    },
    danger: {
      background: globalTheme.primary.dark,
      color: globalTheme.danger.main,
      borderColor: globalTheme.danger.main,
      hoverBackground: globalTheme.danger.dark,
      hoverColor: globalTheme.neutral.white,
      borderRadius: globalTheme.borderRadius.main,
      fontWeight: globalTheme.fontWeight.main,
      hoverColorBorder: globalTheme.danger.main,
      width: globalTheme.buttonWidth.main,
      textShadow: "0 2px 4px rgba(0,0,0,0.18)",
      transition: "unset",
      fontSize: "var(--text-p-size)",
    }
  },
};
