import { defaultTheme as globalTheme } from "../../theme.default";

export interface TextareaTheme {
    states: {
        default: {
            background: string;
            color: string;
            borderColor: string;
            placeholderColor: string;
            borderRadius: string;
            whiteSpace: string;
            focusBorderColor?: string;
            focusBoxShadow?: string;
        }
        transparent: {
            background: string;
            color: string;
            borderColor: string;
            placeholderColor: string;
            borderRadius: string;
            whiteSpace: string;
            focusBorderColor?: string;
            focusBoxShadow?: string;
        }
    }
}

export const defaultTheme: TextareaTheme = {
    states: {
        default: {
            background: globalTheme.neutral.white,
            color: globalTheme.neutral.black,
            borderColor: globalTheme.neutral.white,
            placeholderColor: globalTheme.neutral.gray500,
            borderRadius: globalTheme.borderRadius.main,
            whiteSpace: "unset",
            focusBorderColor: globalTheme.primary.main,
            focusBoxShadow: `0 0 0 0.25rem ${globalTheme.primary.light}`
        },
        transparent: {
            background: "transparent",
            color: "var(--bs-font-color)",
            borderColor: globalTheme.neutral.white,
            placeholderColor: globalTheme.neutral.gray500,
            borderRadius: globalTheme.borderRadius.main,
            whiteSpace: "unset",
            focusBorderColor: globalTheme.primary.main,
            focusBoxShadow: `0 0 0 0.25rem ${globalTheme.primary.light}`
        }
    }
}