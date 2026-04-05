import { useState, useEffect } from "react";

/**
 * Devuelve true si el viewport es menor al breakpoint (mobile)
 * @param breakpoint
 */
export const useIsMobile = (breakpoint: number = 992): boolean => {
  // Inicializar con el valor correcto desde el inicio si estamos en el cliente
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    handleResize(); // inicializa
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
};
