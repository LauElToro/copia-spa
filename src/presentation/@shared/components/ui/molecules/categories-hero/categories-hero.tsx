"use client";

import HeroBase from "@/presentation/@shared/components/ui/molecules/hero/hero-base";
import CategoriesAnimation from "@/presentation/@shared/components/ui/molecules/hero/categories-animation";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";

interface CategoriesHeroProps {
className?: string;
}

const CategoriesHero = ({ className = "" }: CategoriesHeroProps) => {
const { t } = useLanguage();

const slides = t.categories?.heroSlides || [
{
title: "Explorá nuestras categorías",
subtitle: "Encontrá lo que buscás",
description:
"Descubrí productos increíbles organizados por categorías. Navegá y encontrá exactamente lo que necesitás.",
},
{
title: "Todas las categorías",
subtitle: "En un solo lugar",
description:
"Accedé a todas nuestras categorías y explorá miles de productos disponibles.",
},
];

return (
<HeroBase
className={className}
slides={slides}
AnimationComponent={CategoriesAnimation}
bgGradient={{
main: "rgba(34, 197, 94, 0.95)",
mid: "rgba(41, 196, 128, 0.9)",
dark: "rgba(16, 185, 129, 0.8)",
}}
height="400px"
/>
);
};

export default CategoriesHero;
