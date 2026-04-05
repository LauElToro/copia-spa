"use client";
import { Box } from "@mui/material";
import { useState, useEffect } from "react";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import StoreAnimation from "@/presentation/@shared/components/ui/molecules/hero/store-animation";

interface StoresHeroProps {
  className?: string;
}

interface SlideItem {
  title: string;
  subtitle: string;
  description: string;
}

const StoresHero = ({ className = "" }: StoresHeroProps) => {
  const { t } = useLanguage();
  const slides: SlideItem[] = t.stores.heroSlides;
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!slides.length) return;

    const timer = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % slides.length),
      6000
    );

    return () => clearInterval(timer);
  }, [slides.length]);

  // --- Slide ---
  const Slide = ({
    slide,
    active,
  }: {
    slide: SlideItem;
    active: boolean;
  }) => (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        top: "50%",
        transform: "translateY(-50%)",
        transition: "opacity 1s ease, visibility 1s ease",
        opacity: active ? 1 : 0,
        visibility: active ? "visible" : "hidden",
        pointerEvents: active ? "auto" : "none",
      }}
    >
      <Box
        component="h1"
        sx={{
          fontSize: { xs: "2.288rem", md: "2.8rem" },
          fontWeight: 700,
          color: "#fff",
          lineHeight: 1.1,
          mb: { xs: 1, md: 1.5 },
        }}
      >
        {slide.title}
      </Box>

      <Box
        component="span"
        sx={{
          fontSize: { xs: "1.6rem", md: "1.96rem" },
          fontWeight: 700,
          color: "#000",
          display: "block",
          mb: { xs: 1, md: 1.5 },
        }}
      >
        {slide.subtitle}
      </Box>

      <Box
        component="p"
        sx={{
          fontSize: { xs: "1.4rem", md: "1.125rem" },
          color: "#fff",
          mt: { xs: 2, md: 2 },
          mx: "auto",
          maxWidth: "100%",
        }}
      >
        {slide.description}
      </Box>
    </Box>
  );

  // --- Dots ---
  const Dots = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 0.5,
        position: "absolute",
        bottom: { xs: 16, md: 24 },
        left: 0,
        right: 0,
        zIndex: 20,
      }}
    >
      {slides.map((_, i) => (
        <Box
          key={i}
          component="button"
          onClick={() => setCurrentSlide(i)}
          aria-label={t.stores.goToSlide.replace("{number}", String(i + 1))}
          sx={{
            width: i === currentSlide ? 24 : 8,
            height: 8,
            borderRadius: "9999px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            backgroundColor:
              i === currentSlide ? "#ffffff" : "rgba(255,255,255,0.5)",
            "&:hover": { backgroundColor: "#ffffff" },
          }}
        />
      ))}
    </Box>
  );

  return (
    <Box
      component="section"
      className={className}
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "400px",
        background: `
          radial-gradient(circle at 30% 70%, rgba(34,197,94,0.95), rgba(16,185,129,0.8)),
          radial-gradient(ellipse 500px 400px at 70% 30%, rgba(34,197,94,0.9), rgba(16,185,129,0.8))
        `,
        border: "2px solid rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Blur */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 256,
          height: 256,
          backgroundColor: "rgba(255,255,255,0.03)",
          borderRadius: "50%",
          filter: "blur(64px)",
          zIndex: 0,
        }}
      />

      {/* Animated background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "& .store-animation": {
            position: "relative",
            transform: "scale(1.4)",
            width: { xs: "60vw", md: "50vw" },
            height: { xs: "60vh", md: "50vh" },
            maxWidth: "600px",
            maxHeight: "600px",
            opacity: 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "& > div": {
              width: "100% !important",
              height: "100% !important",
            },
            "& svg": {
              width: "100% !important",
              height: "100% !important",
            },
          },
        }}
      >
        <StoreAnimation className="store-animation" width="100%" height="100%" />
      </Box>

      {/* Content */}
      <Box
        sx={{
          zIndex: 1,
          textAlign: "center",
          width: "100%",
          px: { xs: 3, md: 6 },
          maxWidth: "90%",
          mx: "auto",
        }}
      >
        {/* Slides */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            minHeight: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 4,
          }}
        >
          {slides.map((slide, i) => (
            <Slide key={i} slide={slide} active={i === currentSlide} />
          ))}
        </Box>

        <Dots />
      </Box>
    </Box>
  );
};

export default StoresHero;
