import { defaultTheme as globalTheme } from "../../theme.default";
import { FormFieldState, FormFieldStateConfig } from "./form-field-theme";

export const createFormFieldState = (
  config: FormFieldStateConfig
): FormFieldState => ({
  background: config.background,
  color: config.color,
  borderColor: config.borderColor,
  placeholderColor: config.placeholderColor,
  focusBorderColor: config.focusBorderColor,
  focusBoxShadow: config.focusBoxShadow,
  borderRadius: config.borderRadius || globalTheme.borderRadius.main,
  borderLeftWidth: globalTheme.borderWidth.main,
  borderRightWidth: globalTheme.borderWidth.main,
  borderTopWidth: globalTheme.borderWidth.main,
  borderBottomWidth: globalTheme.borderWidth.main,
  borderTopLeftRadius: globalTheme.borderTopLeftRadius.main,
  borderTopRightRadius: globalTheme.borderTopRightRadius.main,
  borderBottomLeftRadius: globalTheme.borderBottomLeftRadius.main,
  borderBottomRightRadius: globalTheme.borderBottomRightRadius.main,
  height: config.height || "2.5rem",
});

export const createGhostState = (): FormFieldState => ({
  background: "transparent",
  color: globalTheme.neutral.white,
  borderColor: globalTheme.neutral.gray500,
  placeholderColor: globalTheme.neutral.gray500,
  focusBorderColor: globalTheme.primary.main,
  focusBoxShadow: "none",
  borderRadius: globalTheme.borderRadius.none,
  borderLeftWidth: globalTheme.borderWidth.none,
  borderRightWidth: globalTheme.borderWidth.none,
  borderTopWidth: globalTheme.borderWidth.none,
  borderBottomWidth: globalTheme.borderWidth.main,
  borderTopLeftRadius: globalTheme.borderTopLeftRadius.none,
  borderTopRightRadius: globalTheme.borderTopRightRadius.none,
  borderBottomLeftRadius: globalTheme.borderBottomLeftRadius.none,
  borderBottomRightRadius: globalTheme.borderBottomRightRadius.none,
  height: "2.5rem",
}); 