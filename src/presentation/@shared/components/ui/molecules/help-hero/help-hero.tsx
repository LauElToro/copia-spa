"use client";

import HeroBase from "@/presentation/@shared/components/ui/molecules/hero/hero-base";
import ContactAnimation from "@/presentation/@shared/components/ui/molecules/hero/contact-animation";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";

interface HelpHeroProps {
className?: string;
}

const HelpHero = ({ className = "" }: HelpHeroProps) => {
const { t } = useLanguage();

const slides = t.help?.heroSlides || [
{
title: t.help?.title || "Centro de Ayuda",
subtitle: t.help?.subtitle || "Estamos aquí para ayudarte",
description:
t.help?.sendQuery ||
"Envíanos tu consulta o sugerencia para mejorar tu experiencia.",
},
];

return (
<HeroBase
className={className}
slides={slides}
AnimationComponent={ContactAnimation}
bgGradient={{
main: "rgba(34, 197, 94, 0.95)",
mid: "rgba(41, 196, 128, 0.9)",
dark: "rgba(16, 185, 129, 0.8)",
}}
height="400px"
/>
);
};

export default HelpHero;
