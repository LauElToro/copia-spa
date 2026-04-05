// theme.ts
import { ThemeColors, defaultTheme as globalTheme } from "../../theme.default";

export interface FooterTheme extends ThemeColors {
  variants: {
    dark: {
      background: string;
      color: string;
      borderColor: string;
      borderWidth: string;
      padding: string;
      linkColor: string;
      linkHoverColor: string;
      titleColor: string;
      titleGradientStyle: {
        color: string;
        transition: 'color 0.3s, opacity 0.3s, transform 0.3s',
        transitionDelay: '0.15s',
        background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: '4 8px 32px rgba(67, 233, 123, 0.25), 0 1.5px 8px rgba(56, 249, 215, 0.15), 0 2px 8px rgba(0,0,0,0.35), 0 1px 0 rgba(0,0,0,0.25)'
      };
    };
    light: {
      background: string;
      color: string;
      borderColor: string;
      borderWidth: string;
      padding: string;
      linkColor: string;
      linkHoverColor: string;
      titleColor: string;
      titleGradientStyle: {
        color: string;
        transition: 'color 0.3s, opacity 0.3s, transform 0.3s',
        transitionDelay: '0.15s',
        background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: '4 8px 32px rgba(67, 233, 123, 0.25), 0 1.5px 8px rgba(56, 249, 215, 0.15), 0 2px 8px rgba(0,0,0,0.35), 0 1px 0 rgba(0,0,0,0.25)'
      };
    };
  };
}

// Tema predeterminado para el navbar
export const defaultTheme: FooterTheme = {
  ...globalTheme,
  variants: {
    dark: {
      background: "var(--bs-footer-bg)",
      color: "#fff",
      borderColor: "var(--bs-primary)",
      borderWidth: "2px",
      padding: "30px",
      linkColor: "var(--bs-link-color)",
      linkHoverColor: "var(--bs-link-hover-color)",
      titleColor: "#43e97b",
      titleGradientStyle: {
        background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        textShadow: '4 8px 32px rgba(67, 233, 123, 0.25), 0 1.5px 8px rgba(56, 249, 215, 0.15), 0 2px 8px rgba(0,0,0,0.35), 0 1px 0 rgba(0,0,0,0.25)',
        transition: 'color 0.3s, opacity 0.3s, transform 0.3s',
        transitionDelay: '0.15s',
      },
    },
    light: {
      background: "var(--bs-footer-bg)",
      color: "#fff",
      borderColor: "var(--bs-primary)",
      borderWidth: "2px",
      padding: "30px",
      linkColor: "var(--bs-link-color)",
      linkHoverColor: "var(--bs-link-hover-color)",
      titleColor: "#43e97b",
      titleGradientStyle: {
        background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        textShadow: '4 8px 32px rgba(67, 233, 123, 0.25), 0 1.5px 8px rgba(56, 249, 215, 0.15), 0 2px 8px rgba(0,0,0,0.35), 0 1px 0 rgba(0,0,0,0.25)',
        transition: 'color 0.3s, opacity 0.3s, transform 0.3s',
        transitionDelay: '0.15s',
      },
    },
  },
};