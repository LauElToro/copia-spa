"use client";

import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";

interface BannerCarouselProps {
  banners: string[];
  interval?: number; // en milisegundos
  className?: string;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  interval = 3000,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, interval);

    return () => clearInterval(timer);
  }, [banners.length, interval]);

  if (banners.length === 0) return null;

  return (
    <Box
      component="section"
      className={className}
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#000000",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { 
            xs: "auto", 
            sm: "auto", 
            md: "400px", 
            lg: "400px" 
          },
          display: "block",
        }}
      >
        {banners.map((banner, index) => (
          <Box
            key={index}
            sx={{
              position: { 
                xs: index === currentIndex ? "relative" : "absolute", 
                sm: index === currentIndex ? "relative" : "absolute",
                md: "absolute", 
                lg: "absolute" 
              },
              top: { 
                xs: index === currentIndex ? "auto" : 0, 
                sm: index === currentIndex ? "auto" : 0,
                md: 0, 
                lg: 0 
              },
              left: 0,
              width: "100%",
              height: { 
                xs: index === currentIndex ? "auto" : "100%", 
                sm: index === currentIndex ? "auto" : "100%",
                md: "100%", 
                lg: "100%" 
              },
              opacity: index === currentIndex ? 1 : 0,
              transition: "opacity 0.8s ease-in-out",
              zIndex: index === currentIndex ? 1 : 0,
              display: "block",
              visibility: index === currentIndex ? "visible" : "hidden",
            }}
          >
            <Box
              component="img"
              src={banner}
              alt={`Banner ${index + 1}`}
              sx={{
                width: "100%",
                height: { 
                  xs: "100%", 
                  sm: "100%", 
                  md: "100%", 
                  lg: "100%" 
                },
                objectFit: { 
                  xs: "cover", 
                  sm: "cover", 
                  md: "cover", 
                  lg: "cover" 
                },
                objectPosition: "center",
                display: "block",
              }}
            />
          </Box>
        ))}

        {/* Indicadores de paginación */}
        <Box
          sx={{
            position: "absolute",
            bottom: { xs: 16, md: 24 },
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 1,
            zIndex: 10,
          }}
        >
          {banners.map((_, index) => (
            <Box
              key={index}
              component="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Ir al banner ${index + 1}`}
              sx={{
                width: index === currentIndex ? 32 : 8,
                height: 8,
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                backgroundColor:
                  index === currentIndex ? "#29C480" : "rgba(255, 255, 255, 0.5)",
                "&:hover": {
                  backgroundColor:
                    index === currentIndex ? "#29C480" : "rgba(255, 255, 255, 0.7)",
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default BannerCarousel;
