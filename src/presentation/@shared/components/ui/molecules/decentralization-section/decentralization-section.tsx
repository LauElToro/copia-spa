import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { Text } from "../../atoms/text";
import { Image } from "../../atoms/image";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import useDevice from "@/presentation/@shared/hooks/use-device";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

interface DecentralizationSectionProps {
  className?: string;
}

const PAYMENT_METHODS = [
  "/images/binance.svg",
  "/images/btc.svg",
  "/images/eth.svg",
  "/images/tron.svg",
  "/images/poly.svg",
  "/images/mc.svg",
  "/images/visa.svg",
];

const DecentralizationSection: React.FC<DecentralizationSectionProps> = ({
  className = "",
}) => {
  const { t } = useLanguage();
  const { isMobile } = useDevice();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const itemsToShow = 5;

  // Solo usar el efecto de rotación en desktop
  useEffect(() => {
    if (isMobile) return; // No usar rotación automática en mobile, Swiper lo maneja
    
    const timer = setInterval(() => {
      setIsAnimating(true);
      // Pequeño delay antes de cambiar para dejar que empiece la animación de salida
      setTimeout(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex >= PAYMENT_METHODS.length - itemsToShow ? 0 : prevIndex + itemsToShow
        );
        setIsAnimating(false);
      }, 400);
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(timer);
  }, [isMobile]);

  // Obtener los 5 iconos actuales para mostrar (solo en desktop)
  const visibleMethods = [];
  if (!isMobile) {
    for (let i = 0; i < itemsToShow; i++) {
      const index = (currentIndex + i) % PAYMENT_METHODS.length;
      visibleMethods.push(PAYMENT_METHODS[index]);
    }
  }

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      {/* Línea separadora arriba - como en el footer */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: 'linear-gradient(90deg, transparent 0%, transparent 5%, #29C480 25%, #29C480 75%, transparent 95%, transparent 100%)',
          boxShadow: '0 0 20px rgba(41, 196, 128, 0.5), 0 0 40px rgba(41, 196, 128, 0.2), inset 0 0 15px rgba(41, 196, 128, 0.15)',
          borderRadius: '9999px',
          zIndex: 10
        }}
      />
      <Box
        component="section"
        className={`${className} relative`}
        sx={{
          py: { xs: 5, md: 20 },
          pt: { xs: 8, md: 24 },
          px: { xs: 4, sm: 6, lg: 8 },
          background: `
            radial-gradient(ellipse 1400px 800px at 50% 30%, #0a2820 0%, #000000 70%),
            radial-gradient(circle at 15% 80%, #1a1a1a 0%, #000000 60%),
            radial-gradient(ellipse 900px 700px at 85% 60%, #0a1a15 0%, #000000 65%)
          `,
          width: "100%",
          position: 'relative',
          borderTop: "1px solid rgba(41, 196, 128, 0.05)",
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                rgba(0, 0, 0, 0.25) 0px,
                rgba(0, 0, 0, 0.25) 1px,
                transparent 1px,
                transparent 2px,
                rgba(10, 40, 32, 0.3) 2px,
                rgba(10, 40, 32, 0.3) 3px,
                transparent 3px,
                transparent 4px
              ),
              repeating-linear-gradient(
                -45deg,
                rgba(0, 0, 0, 0.25) 0px,
                rgba(0, 0, 0, 0.25) 1px,
                transparent 1px,
                transparent 2px,
                rgba(10, 40, 32, 0.3) 2px,
                rgba(10, 40, 32, 0.3) 3px,
                transparent 3px,
                transparent 4px
              )
            `,
            backgroundSize: '6px 6px, 6px 6px',
            opacity: 0.9,
            zIndex: 1,
            pointerEvents: 'none'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                rgba(0, 0, 0, 0.15) 0px,
                rgba(0, 0, 0, 0.15) 1px,
                transparent 1px,
                transparent 2px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(0, 0, 0, 0.15) 0px,
                rgba(0, 0, 0, 0.15) 1px,
                transparent 1px,
                transparent 2px
              )
            `,
            backgroundSize: '3px 3px',
            opacity: 0.7,
            zIndex: 1,
            pointerEvents: 'none',
            mixBlendMode: 'overlay'
          }
        }}
      >
        <Box sx={{
          width: "100%",
          mx: "auto",
          position: "relative",
          zIndex: 2
        }}>
          <Box sx={{
            textAlign: "center",
            mb: { xs: 8, md: 12 }
          }}>
            <Text
              component="h2"
              sx={{
                fontSize: { xs: "2.25rem", md: "3rem" },
                fontWeight: 700,
                color: "#34d399",
                margin: 0,
                marginBottom: { xs: 2, md: 3 },
                padding: 0,
                lineHeight: 1.2,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {t.footer?.joinDecentralization || "Únete a la descentralización con Liberty"}
            </Text>
            <Text
              sx={{
                fontSize: { xs: "1.125rem", md: "1.25rem" },
                fontWeight: 400,
                color: "#ffffff",
                margin: 0,
                marginBottom: { xs: 4, md: 6 },
                padding: 0,
                lineHeight: 1.4,
                maxWidth: "600px",
                mx: "auto",
                opacity: 0.9,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {t.footer?.joinDecentralizationSubtitle || "Compra, vende y transacciona en tiempo real desde cualquier parte del mundo"}
            </Text>
          </Box>

          {/* Mobile: Carrusel con un logo a la vez que rota automáticamente */}
          {isMobile ? (
            <Box
              sx={{
                width: "100%",
                overflow: "hidden",
                px: 2,
                "& .swiper": {
                  width: "100%",
                  overflow: "visible",
                },
                "& .swiper-slide": {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
              }}
            >
              <Swiper
                modules={[Autoplay]}
                slidesPerView={1}
                spaceBetween={0}
                loop={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                style={{
                  width: "100%",
                  paddingBottom: "20px",
                }}
              >
                {PAYMENT_METHODS.map((src, index) => (
                  <SwiperSlide key={`payment-mobile-${index}`}>
                    <Box
                      sx={{
                        width: "200px",
                        height: "200px",
                        mx: "auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          filter: "brightness(0.8) contrast(1.2)",
                          position: "relative",
                          "& img": {
                            objectFit: "contain !important",
                          },
                        }}
                      >
                        <Image
                          src={src}
                          alt={`Payment method ${index + 1}`}
                          width={200}
                          height={200}
                          objectFit="contain"
                          sx={{
                            width: "100%",
                            height: "100%",
                            maxWidth: "100%",
                            maxHeight: "100%",
                          }}
                        />
                      </Box>
                    </Box>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>
          ) : (
            /* Desktop: Se muestran 5 logos y rotan automáticamente */
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 1, md: 1.5 },
                flexWrap: "nowrap",
                overflowX: "visible",
                width: "100%",
                px: { xs: 2, md: 0 },
              }}
            >
              {visibleMethods.map((src, index) => (
                <Box
                  key={`payment-icon-${currentIndex + index}`}
                  sx={{
                    width: { xs: 154, md: 192 },
                    height: { xs: 154, md: 192 },
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    opacity: isAnimating ? 0.7 : 1,
                    transform: isAnimating
                      ? `scale(0.9) rotateY(${Math.sin(Date.now() * 0.01) * 15}deg)`
                      : `scale(1) rotateY(0deg)`,
                    filter: isAnimating
                      ? "blur(1px) brightness(0.9)"
                      : "blur(0px) brightness(1.1)",
                    "&:hover": {
                      transform: "scale(1.1) rotateY(10deg)",
                      filter: "brightness(1.2) drop-shadow(0 10px 25px rgba(41, 196, 128, 0.3))",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      filter: "brightness(0.8) contrast(1.2)",
                      position: "relative",
                      "& img": {
                        objectFit: "contain !important",
                      },
                    }}
                  >
                    <Image
                      src={src}
                      alt={`Payment method ${index + 1}`}
                      width={192}
                      height={192}
                      objectFit="contain"
                      sx={{
                        width: "100%",
                        height: "100%",
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DecentralizationSection;
