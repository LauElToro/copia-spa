  export const formatPrice = (price: number, currency = "USDT") => {
    const formattedNumber = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);

    return `${currency} ${formattedNumber}`;
  };