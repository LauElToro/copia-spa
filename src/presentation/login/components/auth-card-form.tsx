import React from "react";
import { Text } from "../../@shared/components/ui/atoms/text";
import { Button } from "../../@shared/components/ui/atoms/button";
import { RegisterType } from "@/presentation/@shared/types/login";
import { AnimatedSection } from "@/presentation/@shared/components/ui/atoms/animated-section";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";

interface AuthCardFormProps {
  title: string;
  subtitle: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  buttonText: string;
  buttonLoading?: boolean;
  buttonDisabled?: boolean;
  children: React.ReactNode;
  type?: RegisterType;
}

export const AuthCardForm: React.FC<AuthCardFormProps> = ({
  title,
  subtitle,
  onSubmit,
  buttonText,
  buttonLoading,
  buttonDisabled,
  type,
  children,
}) => {
  const { t } = useLanguage();
  const typeLabelMap: Record<RegisterType, string> = {
    user: t.auth.registerUser.toLowerCase(),
    commerce: t.auth.registerCommerce.toLowerCase(),
    seller: t.auth.registerSeller.toLowerCase(),
  };

  return (
    <section>
      <AnimatedSection direction="left" delay={200}>
        <div className="row justify-content-center">
          <div className="col-12" style={{ maxWidth: "800px" }}>
            <div className="bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 border border-[#00ff88]/30 rounded-2xl overflow-hidden backdrop-blur-md p-8 md:p-12 animate-in shadow-2xl shadow-[#00ff88]/20 transition-all duration-700 hover:shadow-[#00ff88]/40 hover:border-[#00ff88]/50 hover:bg-gradient-to-br hover:from-black/95 hover:via-gray-900/90 hover:to-black/95 relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-[#00ff88]/5 before:to-transparent before:animate-pulse before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700 after:absolute after:top-0 after:left-0 after:right-0 after:h-1 after:bg-gradient-to-r after:from-transparent after:via-[#00ff88] after:to-transparent after:shadow-lg after:shadow-[#00ff88]/50">
              {/* Futuristic accent lines */}
              <div className="absolute top-8 left-8 w-16 h-0.5 bg-[#00ff88] opacity-60 animate-pulse"></div>
              <div className="absolute top-16 right-16 w-12 h-0.5 bg-[#00aaff] opacity-40 animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-32 left-16 w-8 h-0.5 bg-[#ff0088] opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>

              <Text variant="h3" weight="black" className="mt-3 text-white font-mono tracking-wider drop-shadow-lg">
                {title}
              </Text>
              <Text className="mb-5 mt-3" variant="h6" weight="normal" style={{ color: "#a0a0a0" }}>
                {subtitle}
              </Text>

              <form onSubmit={onSubmit} className="mt-4">
                {children}

                <div className="w-100 d-flex justify-content-center">
                  <Button
                    className="mt-4 w-75 border-2 bg-gradient-to-r from-[#00ff88] to-[#00cc77] border-[#00ff88] hover:from-[#00cc88] hover:to-[#00aa66] hover:border-[#00ffaa] text-black font-bold transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-[#00ff88]/30 hover:scale-105 hover:border-4 transform"
                    type="submit"
                    size="lg"
                    isLoading={buttonLoading}
                    disabled={buttonDisabled}
                  >
                    {buttonText}
                  </Button>
                </div>
              </form>

              {type ? (
                <div className="mt-5 text-center">
                  <Text align="center" style={{ color: "#8b8b8b" }}>
                    {t.auth.alreadyHaveAccount.replace('{type}', typeLabelMap[type])}{" "}
                    <a href="/login" className="text-[#00ff88] hover:text-[#00aaff] transition-all duration-300 font-semibold relative group overflow-hidden px-2 py-1 rounded-md hover:bg-[#00ff88]/10 transform hover:scale-105">
                      <span className="relative z-10">{t.auth.loginNow}</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/20 to-[#00aaff]/20 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
                    </a>
                  </Text>
                </div>
              ) : (
                <Text align="center" className="mt-5" style={{ color: "#8b8b8b" }}>
                  {t.auth.rememberPassword}{" "}
                  <a href="/login" className="text-[#00ff88] hover:text-[#00aaff] transition-all duration-300 font-semibold relative group overflow-hidden px-2 py-1 rounded-md hover:bg-[#00ff88]/10 transform hover:scale-105">
                    <span className="relative z-10">{t.auth.startSession}</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/20 to-[#00aaff]/20 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
                  </a>
                </Text>
              )}
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
};
