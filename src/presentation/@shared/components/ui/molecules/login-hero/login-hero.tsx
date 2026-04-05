"use client";

import HeroBase from "@/presentation/@shared/components/ui/molecules/hero/hero-base";
import LoginAnimation from "../hero/login-animation";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";

interface LoginHeroProps {
className?: string;
}

const LoginHero = ({ className = "" }: LoginHeroProps) => {
const { t } = useLanguage();

const slides = [
{
title: t.auth?.login || "Iniciar Sesión",
subtitle: t.auth?.welcome || "Bienvenido de nuevo",
description: "Ingresa tus credenciales para acceder a tu cuenta.",
},
];

return (
<HeroBase
className={className}
slides={slides}
AnimationComponent={LoginAnimation}
bgGradient={{
main: "rgba(34, 197, 94, 0.95)",
mid: "rgba(41, 196, 128, 0.9)",
dark: "rgba(16, 185, 129, 0.8)",
}}
height="400px"
/>
);
};

export default LoginHero;


