import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import HomeAnimation from "../hero/home-hero-tienda";
import GradientCTASection from "../main-cta/main-cta";

interface MobileAppCTAProps {
  className?: string;
}

const MobileAppCTA = ({ className = "" }: MobileAppCTAProps) => {
  const { t } = useLanguage();

  return (
    <GradientCTASection
      className={className}
      title={t.homeSections?.mobileApp?.title || ""}
      buttonLabel={t.homeSections?.mobileApp?.cta || ""}
      Illustration={<HomeAnimation />}
    />
  );
};

export default MobileAppCTA;
