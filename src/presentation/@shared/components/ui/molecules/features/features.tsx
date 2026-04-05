"use client";

import React from "react";
import { Shield, AccountBalanceWallet, Visibility, Hub } from "@mui/icons-material";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import useDevice from "@/presentation/@shared/hooks/use-device";
import FeaturesMobile from "./features-mobile";
import FeaturesDesktop from "./features-desktop";

interface Feature {
  id: string;
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  title: string;
  description: string;
}

interface FeaturesProps {
  className?: string;
}

const featureIcons = [Shield, AccountBalanceWallet, Visibility, Hub];

const defaultFeatureItems = [
  {
    title: "Seguridad Blockchain",
    description:
      "Smart contracts garantizan transacciones seguras e inmutables. Sin intermediarios, sin riesgos. Tu dinero y tus productos están protegidos por tecnología descentralizada.",
  },
  {
    title: "0% Comisiones",
    description:
      "Vende sin pagar comisiones. La descentralización elimina intermediarios tradicionales, permitiéndote maximizar tus ganancias y hacer crecer tu negocio sin restricciones.",
  },
  {
    title: "Transparencia Total",
    description:
      "Todas las transacciones son verificables y públicas en la blockchain. Construye confianza con tus clientes a través de la transparencia descentralizada.",
  },
  {
    title: "Descentralización Real",
    description:
      "Opera sin dependencia de bancos o plataformas centralizadas. Libertad financiera real con tecnología blockchain que funciona las 24/7, sin fronteras.",
  },
];

const Features = ({}: FeaturesProps) => {
  const { t } = useLanguage();
  const { isMobile } = useDevice();

  const translatedItems = t.home?.featuresSection?.items ?? defaultFeatureItems;

  const features: Feature[] = translatedItems.map((item, index) => ({
    id: `${index}-${item.title}`,
    icon: featureIcons[index % featureIcons.length] || Shield,
    title: item.title,
    description: item.description,
  }));

  const sectionHeading =
    t.home?.featuresSection?.heading ?? "Por qué elegir Liberty Club";
  const sectionSubtitle =
    t.home?.featuresSection?.subtitle ??
    "El futuro del comercio descentralizado. Blockchain, 0% comisiones y libertad financiera real";

  // Render mobile or desktop component based on device
  if (isMobile) {
    return (
      <FeaturesMobile
        features={features}
        sectionHeading={sectionHeading}
        sectionSubtitle={sectionSubtitle}
      />
    );
  }

  return (
    <FeaturesDesktop
      features={features}
      sectionHeading={sectionHeading}
      sectionSubtitle={sectionSubtitle}
    />
  );
};

export default Features;
