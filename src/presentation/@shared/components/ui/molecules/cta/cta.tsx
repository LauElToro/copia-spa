import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import SellBannerAnimation from "../hero/home-hero-sell";
import GradientCTASection from "../main-cta/main-cta";

interface CTAProps {
  className?: string;
}

const CTA = ({ className = "" }: CTAProps) => {
  const { t } = useLanguage();

  return (
    <GradientCTASection
      className={className}
      title={
        t.cta?.title ||
        "Vende sin comisiones. Elige tu plan y comienza a vender más"
      }
      buttonLabel={t.cta?.button || "¡Comenzar!"}
      Illustration={<SellBannerAnimation />}
    />
  );
};

export default CTA;
