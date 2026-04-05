"use client";

import { Box } from "@mui/material";
import { useState, useEffect } from "react";

export interface Slide {
  title: string;
  subtitle: string;
  description: string;
}

export interface HeroBaseProps {
  slides: Slide[];
  AnimationComponent?: React.ComponentType<{ className?: string; width?: number | string; height?: number | string }>;
  className?: string;
  height?: string;
  bgGradient?: { main: string; mid: string; dark: string };
}
const HeroBase = ({
slides,
AnimationComponent,
className = "",
}: HeroBaseProps) => {
const [currentSlide, setCurrentSlide] = useState(0);

// Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length]);

return (
<Box
component="section"
className={className}
sx={{
position: "relative",
overflow: "hidden",
width: "100%",
height: "400px",
boxSizing: "border-box",
background: `           radial-gradient(circle at 30% 70%, rgba(34, 197, 94, 0.95) 0%, rgba(41, 196, 128, 0.9) 30%, rgba(16, 185, 129, 0.8) 50%),
          radial-gradient(ellipse 500px 400px at 70% 30%, rgba(34, 197, 94, 0.9) 0%, rgba(41, 196, 128, 0.85) 40%, rgba(16, 185, 129, 0.8) 70%)
        `,
border: "2px solid rgba(255, 255, 255, 0.2)",
display: "flex",
alignItems: "center",
justifyContent: "center",
}}
>
{/* Blur decorativo */}
<Box
sx={{
position: "absolute",
top: 0,
right: 0,
width: 256,
height: 256,
backgroundColor: "rgba(255, 255, 255, 0.03)",
borderRadius: "50%",
filter: "blur(64px)",
zIndex: 0,
}}
/>

  {/* Animación de fondo */}
  {AnimationComponent && (
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
      <AnimationComponent className="store-animation" width="100%" height="100%" />
    </Box>
  )}

  {/* Contenido principal */}
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
        <Box
          key={i}
          sx={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            width: "100%",
            transform: "translateY(-50%)",
            transition: "opacity 1s ease, visibility 1s ease",
            opacity: i === currentSlide ? 1 : 0,
            visibility: i === currentSlide ? "visible" : "hidden",

          }}
        >
          <Box
            component="h1"
            sx={{
              fontSize: { xs: "1.5rem", md: "2.8rem" },
              mb: { xs: 1, md: 1.5 },
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.1,
            }}
          >
            {slide.title}
          </Box>
          {slide.subtitle && (
            <Box
              component="span"
              sx={{
                mt: 0.5,
                fontSize: { xs: "1.25rem", md: "1.96rem" },
                fontWeight: 700,
                color: "#000",
                display: "block",
                mb: { xs: 1, md: 1.5 },
              }}
            >
              {slide.subtitle}
            </Box>
          )}
          {slide.description && (
            <Box
              component="p"
              sx={{
                fontSize: { xs: "1rem", md: "1.125rem" },
                color: "#fff",
                mt: 2,
                mx: "auto",
                maxWidth: "100%",
              }}
            >
              {slide.description}
            </Box>
          )}
        </Box>
      ))}
    </Box>

    {/* Dots */}
    {slides.length > 1 && (
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
            aria-label={`Ir a slide ${i + 1}`}
            sx={{
              width: i === currentSlide ? 24 : 8,
              height: 8,
              borderRadius: "9999px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backgroundColor: i === currentSlide ? "#fff" : "rgba(255, 255, 255, 0.5)",
              "&:hover": { backgroundColor: "#fff" },
            }}
          />
        ))}
      </Box>
    )}
  </Box>
</Box>


);
};

export default HeroBase;
