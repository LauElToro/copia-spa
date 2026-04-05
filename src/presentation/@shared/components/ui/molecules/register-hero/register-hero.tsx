"use client";

import HeroBase from "@/presentation/@shared/components/ui/molecules/hero/hero-base";
import RegisterAnimation from "../hero/register-animation";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { RegisterType } from "@/presentation/@shared/types/login";

interface RegisterHeroProps {
className?: string;
type?: RegisterType;
}

const RegisterHero = ({ className = "", type = "user" }: RegisterHeroProps) => {
const { t } = useLanguage();

const slides = [
{
title:
type === "seller"
? t.auth?.registerSeller || "Registrarse como Vendedor"
: type === "commerce"
? t.auth?.registerCommerce || "Registrarse como Comercio"
: t.auth?.registerUser || "Registrarse como Usuario",
subtitle:
type === "seller"
? "Únete como vendedor"
: type === "commerce"
? "Únete como comercio"
: "Crea tu cuenta",
description:
type === "seller"
? "Comienza a vender en nuestra plataforma y expande tu negocio."
: type === "commerce"
? "Potencia tu comercio y llega a más clientes."
: "Completa el formulario para crear tu cuenta y empezar a comprar.",
},
];

return (
<HeroBase
className={className}
slides={slides}
AnimationComponent={RegisterAnimation}
bgGradient={{
main: "rgba(34, 197, 94, 0.95)",
mid: "rgba(41, 196, 128, 0.9)",
dark: "rgba(16, 185, 129, 0.8)",
}}
height="400px"
/>
);
};

export default RegisterHero;

