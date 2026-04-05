export interface CounterTheme {
  base: string;
  variants: {
    default: string;
    primary: string;
    success: string;
    warning: string;
    danger: string;
  };
  sizes: {
    sm: string;
    md: string;
    lg: string;
  };
}

export const counterTheme: CounterTheme = {
  base: "d-inline-flex align-items-center justify-content-center fw-bold rounded-circle",
  variants: {
    default: "bg-secondary text-white",
    primary: "bg-primary text-white",
    success: "bg-success text-white",
    warning: "bg-warning text-dark",
    danger: "bg-danger text-white",
  },
  sizes: {
    sm: "w-5 h-5 fs-6",
    md: "w-6 h-6 fs-6",
    lg: "w-8 h-8 fs-5",
  },
};
