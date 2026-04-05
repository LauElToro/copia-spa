export interface QuantitySelectorTheme {
  base: string;
  sizes: {
    sm: string;
    md: string;
    lg: string;
  };
  button: {
    base: string;
    sizes: {
      sm: string;
      md: string;
      lg: string;
    };
    enabled: string;
    disabled: string;
  };
  input: {
    base: string;
    sizes: {
      sm: string;
      md: string;
      lg: string;
    };
    enabled: string;
    disabled: string;
  };
}

export const quantitySelectorTheme: QuantitySelectorTheme = {
  base: 'd-flex align-items-center quantity-selector',
  sizes: {
    sm: 'h-25',
    md: 'h-32',
    lg: 'h-36'
  },
  button: {
    base: 'btn border-0 d-flex align-items-center justify-content-center',
    sizes: {
      sm: 'px-2 py-1',
      md: 'px-3 py-2',
      lg: 'px-4 py-2'
    },
    enabled: 'btn-outline-secondary',
    disabled: 'btn-outline-secondary opacity-50'
  },
  input: {
    base: 'form-control border-0 text-center fw-bold text-dark',
    sizes: {
      sm: 'px-2 py-1',
      md: 'px-3 py-2',
      lg: 'px-4 py-2'
    },
    enabled: 'bg-transparent',
    disabled: 'bg-light opacity-50'
  }
};
