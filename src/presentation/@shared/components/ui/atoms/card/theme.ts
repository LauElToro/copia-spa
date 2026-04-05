import { CardTheme } from "./types";

export const defaultTheme: CardTheme = {
  variants: {
    default: {
      background: "#ffffff",
      borderColor: "#dee2e6",
      shadow: "none",
    },
    outlined: {
      background: "#ffffff",
      borderColor: "#dee2e6",
      shadow: "none",
    },
    elevated: {
      background: "#ffffff",
      borderColor: "transparent",
      shadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
    },
    primary: {
      background: "var(--bs-banner-bg)",
      borderColor: "#49dc81",
      shadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
    },
  },
  header: {
    background: "#ffffff",
    borderColor: "#dee2e6",
    padding: "1rem",
  },
  body: {
    background: "var(--bs-banner-bg)",
    padding: "0rem",
  },
  footer: {
    background: "#ffffff",
    borderColor: "#dee2e6",
    padding: "1rem",
  },
  borderRadius: {
    sm: "3px",
    main: "5px",
    md: "8px",
    none: "0",
  },
  primary: {
    main: "#29C480",
  },
};
