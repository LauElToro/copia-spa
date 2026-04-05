"use client";

import HeroBase from "@/presentation/@shared/components/ui/molecules/hero/hero-base";
import RestrictedAreaAnimation from "@/presentation/@shared/components/ui/molecules/hero/restricted-area-animation";

interface RestrictedHeroProps {
  className?: string;
}

const RestrictedHero = ({ className = "" }: RestrictedHeroProps) => {
  const slides = [
    {
      title: "",
      subtitle: "",
      description:""
    },
  ];

  return (
    <HeroBase
      className={className}
      slides={slides}
      AnimationComponent={RestrictedAreaAnimation}
      bgGradient={{
        main: "rgba(34, 197, 94, 0.95)",
        mid: "rgba(41, 196, 128, 0.9)",
        dark: "rgba(16, 185, 129, 0.8)",
      }}
      height="400px"
    />
  );
};

export default RestrictedHero;
