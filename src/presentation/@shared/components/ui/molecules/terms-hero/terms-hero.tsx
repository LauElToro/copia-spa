"use client";

import HeroBase from "@/presentation/@shared/components/ui/molecules/hero/hero-base";
import TermsAnimation from "@/presentation/@shared/components/ui/molecules/hero/terms-animation";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";

export interface TermsHeroProps {
title?: string;
subtitle?: string;
description?: string;
className?: string;
}

const TermsHero = ({ title, subtitle, description, className = "" }: TermsHeroProps) => {
const { t } = useLanguage();

const slides = [
{
title: title || t.terms?.title || "Términos y Condiciones",
subtitle: subtitle || t.terms?.lastUpdate || "Última actualización: 02/07/2025",
description:
description || t.terms?.description || "Lee detenidamente nuestros términos y condiciones de uso de la plataforma.",
},
];

return (
<HeroBase
className={className}
slides={slides}
AnimationComponent={TermsAnimation}
bgGradient={{
main: "rgba(34, 197, 94, 0.95)",
mid: "rgba(41, 196, 128, 0.9)",
dark: "rgba(16, 185, 129, 0.8)",
}}
height="400px"
/>
);
};

export default TermsHero;

