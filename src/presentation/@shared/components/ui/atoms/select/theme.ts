import { defaultTheme as globalTheme } from "../../theme.default";
import { SelectTheme } from "./types";
import { createFormFieldState, createGhostState } from "../shared/form-field-utils";

export const defaultTheme: SelectTheme = {
  states: {
    default: createFormFieldState({
      background: "var(--bg-semi-black)",
      color: globalTheme.neutral.white,
      borderColor: globalTheme.neutral.white,
      placeholderColor: globalTheme.neutral.white,
      focusBorderColor: globalTheme.primary.main,
      focusBoxShadow: globalTheme.focus.primary,
    }),
    error: createFormFieldState({
      background: globalTheme.neutral.white,
      color: globalTheme.neutral.gray800,
      borderColor: globalTheme.danger.main,
      placeholderColor: globalTheme.neutral.gray600,
      focusBorderColor: globalTheme.danger.main,
      focusBoxShadow: globalTheme.focus.danger,
    }),
    success: createFormFieldState({
      background: globalTheme.neutral.white,
      color: globalTheme.neutral.gray900,
      borderColor: globalTheme.success.main,
      placeholderColor: globalTheme.neutral.gray500,
      focusBorderColor: globalTheme.success.main,
      focusBoxShadow: globalTheme.focus.success,
    }),
    ghost: createGhostState(),
    modern: createFormFieldState({
      background: '#1f2937', // gray-800
      color: '#ffffff', // white
      borderColor: '#374151', // gray-700
      placeholderColor: '#9ca3af', // gray-400
      focusBorderColor: '#22c55e', // green-500
      focusBoxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)',
      borderRadius: '4px',
      height: '56px',
    }),
  },
};
