"use client";

import { Box, Button } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CryptoWeb3Animation from "./crypto-web3-animation";

interface Slide {
  title: string;
  subtitle: string;
  description: string;
  primaryCta?: string;
  secondaryCta?: string;
}

interface HeroMobileProps {
  slides: Slide[];
  className?: string;
}

const HeroMobile = ({ slides, className = '' }: HeroMobileProps) => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [buttonsAnimated, setButtonsAnimated] = useState(false);

  const activeSlide = slides[currentSlide] ?? slides[0];
  const primaryCtaLabel = activeSlide?.primaryCta ?? "Empezar ahora";
  const secondaryCtaLabel = activeSlide?.secondaryCta ?? "Conocer más";

  const handlePrimaryClick = () => {
    const label = primaryCtaLabel.toLowerCase();
    if (label.includes("crear") || label.includes("tienda") || label.includes("empezar")) {
      router.push("/register?type=seller");
    } else if (label.includes("ofertas") || label.includes("ver")) {
      router.push("/ofertas");
    } else {
      router.push("/sellers");
    }
  };

  const handleSecondaryClick = () => {
    router.push("/sellers");
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    setButtonsAnimated(false);
    const timer = setTimeout(() => {
      setButtonsAnimated(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  return (
    <Box
      component="section"
      className={className}
      sx={{
        position: "relative",
        pt: 3,
        pb: 4,
        px: 2,
        overflow: "hidden",
        width: "100%",
        minHeight: "100vh",
        maxHeight: "100vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Contenido principal */}
      <Box
        sx={{
          maxWidth: "100%",
          mx: "auto",
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          width: "100%",
        }}
      >
        {/* Slides */}
        <Box
          sx={{
            textAlign: "center",
            px: 1,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            pt: 4,
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              minHeight: "200px",
            }}
          >
            {slides.map((s, i) => {
              const slideTitle = s.title ?? "";
              const slideSubtitle = s.subtitle ?? "";
              const slideDescription = s.description ?? "";

              return (
                <Box
                  key={i}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    width: "100%",
                    transition: "opacity 1s ease, visibility 1s ease",
                    opacity: i === currentSlide ? 1 : 0,
                    visibility: i === currentSlide ? "visible" : "hidden",
                    zIndex: i === currentSlide ? 1 : 0,
                    pointerEvents: i === currentSlide ? "auto" : "none",
                  }}
                >
                  <Box
                    component="h1"
                    sx={{
                      fontSize: "1.5rem",
                      mb: 0.5,
                      margin: 0,
                      padding: 0,
                      width: "100%",
                      fontWeight: 700,
                      color: "#ffffff",
                      lineHeight: 1.2,
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      px: 1,
                    }}
                  >
                    {slideTitle}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      mt: 0,
                      width: "100%",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#29C480",
                      display: "block",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      px: 1,
                    }}
                  >
                    {slideSubtitle}
                  </Box>
                  <Box
                    component="p"
                    sx={{
                      fontSize: "0.9375rem",
                      color: "#94a3b8",
                      mb: 3,
                      mt: 2,
                      maxWidth: "100%",
                      mx: "auto",
                      margin: "12px auto 0",
                      padding: 0,
                      lineHeight: 1.6,
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      px: 2,
                    }}
                  >
                    {slideDescription}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            justifyContent: "center",
            mt: "auto",
            mb: 2,
            position: "relative",
            width: "100%",
            zIndex: 20,
            px: 2,
          }}
        >
          <Button
            fullWidth
            onClick={handlePrimaryClick}
            sx={{
              px: 3,
              py: 1.5,
              backgroundColor: "#29C480",
              color: "#1e293b",
              fontWeight: 600,
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "0.9375rem",
              transition: "background-color 0.3s ease, color 0.3s ease",
              opacity: 0,
              transform: "translateY(30px)",
              animation: buttonsAnimated ? "buttonSlideUpFade 0.6s ease-out forwards" : "none",
              "&:hover": {
                backgroundColor: "#ffffff",
                color: "#000000",
              },
              "& .MuiSvgIcon-root": {
                transition: "transform 0.3s ease",
              },
              "&:hover .MuiSvgIcon-root": {
                transform: "translateX(4px)",
              },
            }}
          >
            {primaryCtaLabel}
            <ArrowForward sx={{ fontSize: 16, ml: 0.5 }} />
          </Button>
          <Button
            fullWidth
            onClick={handleSecondaryClick}
            variant="outlined"
            sx={{
              px: 3,
              py: 1.5,
              color: "#29C480",
              borderColor: "#29C480",
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "0.9375rem",
              transition: "all 0.3s ease",
              opacity: 0,
              transform: "translateY(30px)",
              animation: buttonsAnimated ? "buttonSlideUpFade 0.6s ease-out 0.2s forwards" : "none",
              "&:hover": {
                borderColor: "#ffffff",
                color: "#ffffff",
                backgroundColor: "rgba(41, 196, 128, 0.1)",
              },
            }}
          >
            {secondaryCtaLabel}
          </Button>
        </Box>

        {/* Carousel dots */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 0.5,
            mb: 2,
            mt: 1,
            position: "relative",
            zIndex: 20,
          }}
        >
          {slides.map((_, i) => (
            <Box
              key={i}
              component="button"
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              sx={{
                width: i === currentSlide ? 24 : 8,
                height: 8,
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                backgroundColor: i === currentSlide ? "#29C480" : "#475569",
                "&:hover": {
                  backgroundColor: i === currentSlide ? "#29C480" : "#64748b",
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Animated background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          overflow: "hidden",
          "& .crypto-animation": {
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -30%)",
            width: "120vw",
            height: "120vh",
            maxHeight: "100vh",
            opacity: 0.8,
          },
        }}
      >
        <CryptoWeb3Animation className="crypto-animation" />
      </Box>

      {/* Custom keyframes */}
      <style jsx global>{`
        @keyframes buttonSlideUpFade {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
};

export default HeroMobile;
