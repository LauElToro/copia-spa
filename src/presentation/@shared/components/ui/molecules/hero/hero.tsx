"use client";

import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import useDevice from "@/presentation/@shared/hooks/use-device";
import HeroMobile from "./hero-mobile";
import HeroDesktop from "./hero-desktop";

interface HeroProps {
  className?: string;
}

const defaultSlides = [
  {
    title: "Creá tu tienda",
    subtitle: "Y ve cómo tu negocio se potencia",
    description: "Vendiendo sin comisiones. Potenciá tu negocio con nuestra plataforma y alcanzá más clientes.",
    primaryCta: "Crear tienda",
    secondaryCta: "Saber más"
  },
  {
    title: "¡Aprovechá las mejores ofertas!",
    subtitle: "Y conseguí eso que tanto querés",
    description: "Descubrí productos increíbles a los mejores precios. Encontrá lo que buscás en nuestra plataforma.",
    primaryCta: "Ver ofertas",
    secondaryCta: "Explorar"
  },
  {
    title: "Hacé crecer tu negocio sin fronteras",
    subtitle: "Vendé y cobrá con libertad",
    description: "Desde cualquier parte del mundo. Expandí tu comercio globalmente con total libertad financiera.",
    primaryCta: "Empezar ahora",
    secondaryCta: "Conocer más"
  }
];

const Hero = ({ className = '' }: HeroProps) => {
  const { t } = useLanguage();
  const { isMobile } = useDevice();

  const translatedSlides = t.home?.heroSlides;
  const slides = translatedSlides && translatedSlides.length ? translatedSlides : defaultSlides;

  // Render mobile or desktop component based on device
  if (isMobile) {
    return <HeroMobile slides={slides} className={className} />;
  }

  return <HeroDesktop slides={slides} className={className} />;
};

export default Hero;
