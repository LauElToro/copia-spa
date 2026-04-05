"use client";

import HeroBase from "@/presentation/@shared/components/ui/molecules/hero/hero-base";
import SellerAnimation from "@/presentation/@shared/components/ui/molecules/hero/seller-animation";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";

interface SellerHeroProps {
className?: string;
}

const SellerHero = ({ className = "" }: SellerHeroProps) => {
const { t } = useLanguage();

const slides = t.sellers?.heroSlides || [
{
title: "Todo lo que vendés, te queda a vos",
subtitle: "Encontrá lo que buscás. En Liberty Club no te cobramos comisión.",
description: "Te llevás el 100% por venta.",
},
{
title: "Cerrá ventas sin vueltas y cobrá sin intermediarios.",
subtitle: "Mostrá tus productos sin restricciones y hacé crecer tu negocio a tu manera.",
description: "Gestioná tus publicaciones como quieras, sin costos ocultos ni sorpresas.",
},
];

return (
<HeroBase
  className={className}
  slides={slides}
  AnimationComponent={SellerAnimation} // sin <>
  bgGradient={{
    main: "rgba(34, 197, 94, 0.95)",
    mid: "rgba(41, 196, 128, 0.9)",
    dark: "rgba(16, 185, 129, 0.8)",
  }}
  height="400px"
/>
);
};

export default SellerHero;


