import { CheckboxTheme } from "./types";

export const defaultTheme: CheckboxTheme = {
  states: {
    default: {
      background: "#ffffff",
      color: "#212529",
      borderColor: "#ced4da",
      focusBorderColor: "#86b7fe",
      focusBoxShadow: "0 0 0 0.25rem rgba(13, 110, 253, 0.25)",
      checkedBackground: "#0d6efd",
      checkedBorderColor: "#0d6efd",
    },
    error: {
      background: "#ffffff",
      color: "#dc3545",
      borderColor: "#dc3545",
      checkedBackground: "#dc3545",
      checkedBorderColor: "#dc3545",
    },
    success: {
      background: "#ffffff",
      color: "#198754",
      borderColor: "#198754",
      checkedBackground: "#198754",
      checkedBorderColor: "#198754",
    },
  },
};
