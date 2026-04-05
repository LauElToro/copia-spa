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

interface HeroDesktopProps {
  slides: Slide[];
  className?: string;
}

const HeroDesktop = ({ slides, className = '' }: HeroDesktopProps) => {
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
        pt: { xs: 2, md: 4 },
        pb: { xs: 6, md: 4 },
        px: { xs: 1, sm: 1.5, lg: 2 },
        overflow: "hidden",
        width: "100%",
        maxHeight: "100vh",
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          maxWidth: "64rem",
          mx: "auto",
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <Box sx={{ textAlign: "center", px: { xs: 2, md: 0 } }}>
          {/* Slides */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              pt: 0,
            }}
          >
            {slides.map((s, i) => {
              const fallbackSlide = slides[i % slides.length] ?? slides[0];
              const slideTitle = s.title ?? fallbackSlide.title;
              const slideSubtitle = s.subtitle ?? fallbackSlide.subtitle;
              const slideDescription = s.description ?? fallbackSlide.description;

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
                      fontSize: { xs: "1.5rem", md: "3.5rem" },
                      mb: { xs: 0, md: 0 },
                      margin: 0,
                      padding: 0,
                      width: "100%",
                      fontWeight: 700,
                      color: "#ffffff",
                      lineHeight: 1.1,
                      marginTop: { xs: 5, md: 0 },
                    }}
                  >
                    {slideTitle}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      mt: { xs: -0.5, md: -0.5 },
                      width: "100%",
                      fontSize: { xs: "1.25rem", md: "3.5rem" },
                      fontWeight: 700,
                      color: "#29C480",
                      display: "block",
                    }}
                  >
                    {slideSubtitle}
                  </Box>
                  <Box
                    component="p"
                    className="hero-text"
                    sx={{
                      fontSize: { xs: "1.0rem", md: "1.125rem" },
                      color: "#94a3b8",
                      mb: { xs: 3, md: 6 },
                      mt: { xs: 3, md: 4 },
                      maxWidth: "42rem",
                      mx: "auto",
                      margin: "0 auto",
                      padding: 0,
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
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "center",
            mt: { xs: 0, md: "auto" },
            mb: { xs: 0, md: 12 },
            position: { xs: "absolute", md: "relative" },
            bottom: { xs: 140, md: "auto" },
            left: { xs: 0, md: "auto" },
            right: { xs: 0, md: "auto" },
            width: "100%",
            zIndex: 20,
          }}
        >
          <Button
            onClick={handlePrimaryClick}
            sx={{
              px: 4,
              py: 1.5,
              backgroundColor: "#29C480",
              color: "#1e293b",
              fontWeight: 600,
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "1rem",
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
            <ArrowForward sx={{ fontSize: 18, ml: 0.5 }} />
          </Button>
          <Button
            onClick={handleSecondaryClick}
            variant="outlined"
            className="border-glow-hover"
            sx={{
              px: 4,
              py: 1.5,
              color: "#29C480",
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "1rem",
              transition: "all 0.3s ease",
              opacity: 0,
              transform: "translateY(30px)",
              animation: buttonsAnimated ? "buttonSlideUpFade 0.6s ease-out 0.2s forwards" : "none",
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
            mb: { xs: 4, md: 10 },
            mt: { xs: 2, md: 0 },
            pb: { xs: 3, md: 0 },
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
            top: { xs: "25%", md: "50%" },
            left: "50%",
            transform: { xs: "translate(-50%, -35%)", md: "translate(-50%, -50%)" },
            width: { xs: "120vw", md: "100vw" },
            height: { xs: "120vh", md: "100vh" },
            maxHeight: "100vh",
            opacity: 0.9,
          },
        }}
      >
        <CryptoWeb3Animation className="crypto-animation" />
      </Box>

      {/* Custom keyframes */}
      <style jsx global>{`
        @keyframes moveblocks {
          0% { transform: translate3d(160px, -93px, 0); }
          50%, 100% { transform: translate(0); }
        }

        @keyframes firstBlock {
          0%, 15% { opacity: 0; }
          40%, 100% { opacity: 1; }
        }

        @keyframes blockdis {
          30% { opacity: 1; }
          40%, 100% { opacity: 0; transform: translate3d(-160px, 93px, 0); }
        }

        @keyframes up {
          to { transform: translate(0, -25px); }
        }

        @keyframes updown {
          100% { transform: translate(0, -20px); }
        }

        @keyframes particles {
          0%, 100% { transform: translate(0); }
          50% { transform: translate(10px, 15px); }
        }

        @keyframes p {
          85%, 100% { opacity: 0; }
        }

        @keyframes particlesPoly {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }

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

        @keyframes aurora-1 {
          0% {
            top: 0;
            right: 0;
          }
          50% {
            top: 100%;
            right: 75%;
          }
          75% {
            top: 100%;
            right: 25%;
          }
          100% {
            top: 0;
            right: 0;
          }
        }

        @keyframes aurora-2 {
          0% {
            top: -50%;
            left: 0%;
          }
          60% {
            top: 100%;
            left: 75%;
          }
          85% {
            top: 100%;
            left: 25%;
          }
          100% {
            top: -50%;
            left: 0%;
          }
        }

        @keyframes aurora-3 {
          0% {
            bottom: 0;
            left: 0;
          }
          40% {
            bottom: 100%;
            left: 75%;
          }
          65% {
            bottom: 40%;
            left: 50%;
          }
          100% {
            bottom: 0;
            left: 0;
          }
        }

        @keyframes aurora-4 {
          0% {
            bottom: -50%;
            right: 0;
          }
          50% {
            bottom: 0%;
            right: 40%;
          }
          90% {
            bottom: 50%;
            right: 25%;
          }
          100% {
            bottom: -50%;
            right: 0;
          }
        }

        @keyframes aurora-border {
          0% {
            border-radius: 37% 29% 27% 27% / 28% 25% 41% 37%;
          }
          25% {
            border-radius: 47% 29% 39% 49% / 61% 19% 66% 26%;
          }
          50% {
            border-radius: 57% 23% 47% 72% / 63% 17% 66% 33%;
          }
          75% {
            border-radius: 28% 49% 29% 100% / 93% 20% 64% 25%;
          }
          100% {
            border-radius: 37% 29% 27% 27% / 28% 25% 41% 37%;
          }
        }
      `}</style>
    </Box>
  );
};

export default HeroDesktop;
