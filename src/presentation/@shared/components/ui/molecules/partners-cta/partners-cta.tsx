import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import PlanBannerAnimation from "../hero/home-hero-plan";
import GradientCTASection from "../main-cta/main-cta";

interface PartnersCTAProps {
  className?: string;
}

const PartnersCTA = ({ className = "" }: PartnersCTAProps) => {
  const { t } = useLanguage();

  return (
    <GradientCTASection
      className={className}
      title={
        t.partnersCta?.title ||
        "¡Únete nosotros y lleva tu marca al siguiente nivel vive La Experiencia Liberty!"
      }
      buttonLabel={t.partnersCta?.button || "¡Comenzar!"}
      Illustration={<PlanBannerAnimation />}
    />
  );
};

export default PartnersCTA;
