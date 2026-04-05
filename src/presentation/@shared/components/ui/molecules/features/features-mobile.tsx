"use client";

import React from "react";
import { Box, Container } from "@mui/material";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface Feature {
  id: string;
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  title: string;
  description: string;
}

interface FeaturesMobileProps {
  features: Feature[];
  sectionHeading: string;
  sectionSubtitle: string;
}

const FeatureCardMobile = ({ feature }: { feature: Feature }) => {
  const Icon = feature.icon;

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "20px",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        border: "1px solid rgba(41, 196, 128, 0.1)",
        minHeight: "auto",
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        p: 3,
        boxShadow: "inset 0 0 1px rgba(41, 196, 128, 0.05)",
        boxSizing: "border-box",
      }}
    >
      {/* Background gradients */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom right, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0), rgba(15, 23, 42, 0.05))",
        }}
      />

      {/* Icon container at top */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2.5,
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              width: 70,
              height: 70,
              backgroundColor: "#29C480",
              borderRadius: "50%",
              filter: "blur(20px)",
              opacity: 0.15,
            }}
          />
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "linear-gradient(to bottom right, #29C480, #1a9f67)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 10,
              boxShadow: "0 0 15px rgba(41, 196, 128, 0.2), inset 0 0 15px rgba(255, 255, 255, 0.03)",
              "& svg": {
                fontSize: "28px !important",
                color: "white",
              },
            }}
          >
            <Icon />
          </Box>
        </Box>
      </Box>

      {/* Title */}
      <Box
        component="h3"
        sx={{
          fontSize: "1.125rem",
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          mb: 2,
          margin: 0,
          padding: 0,
          position: "relative",
          zIndex: 10,
          wordBreak: "break-word",
          overflowWrap: "break-word",
          px: 1,
        }}
      >
        {feature.title}
      </Box>

      {/* Description */}
      <Box
        component="p"
        sx={{
          color: "#e2e8f0",
          fontSize: "0.875rem",
          lineHeight: 1.7,
          textAlign: "center",
          margin: 0,
          padding: 0,
          position: "relative",
          zIndex: 10,
          opacity: 0.9,
          wordBreak: "break-word",
          overflowWrap: "break-word",
          hyphens: "auto",
          px: 1,
        }}
      >
        {feature.description}
      </Box>
    </Box>
  );
};

const FeaturesMobile = ({ features, sectionHeading, sectionSubtitle }: FeaturesMobileProps) => {
  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      {/* Línea separadora arriba */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background:
            "linear-gradient(90deg, transparent 0%, transparent 5%, #29C480 25%, #29C480 75%, transparent 95%, transparent 100%)",
          boxShadow:
            "0 0 20px rgba(41, 196, 128, 0.5), 0 0 40px rgba(41, 196, 128, 0.2), inset 0 0 15px rgba(41, 196, 128, 0.15)",
          borderRadius: "9999px",
          zIndex: 10,
        }}
      />
      <Box
        component="section"
        id="features"
        sx={{
          py: 5,
          pt: 7,
          background: `
            radial-gradient(ellipse 1400px 800px at 50% 30%, #0a2820 0%, #000000 70%),
            radial-gradient(circle at 15% 80%, #1a1a1a 0%, #000000 60%),
            radial-gradient(ellipse 900px 700px at 85% 60%, #0a1a15 0%, #000000 65%)
          `,
          width: "100%",
          maxWidth: "100%",
          position: "relative",
          borderTop: "1px solid rgba(41, 196, 128, 0.05)",
          overflow: "hidden",
          boxSizing: "border-box",
          "&::before": {
            content: '""',
            position: "absolute",
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
              )
            `,
            backgroundSize: "6px 6px",
            opacity: 0.9,
            zIndex: 0,
            pointerEvents: "none",
          },
        }}
      >
        <Container
          maxWidth="xl"
          sx={{ 
            px: { xs: 2, sm: 4 }, 
            position: "relative", 
            zIndex: 1,
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4, px: { xs: 1, sm: 0 } }}>
            <Box
              component="h2"
              sx={{
                fontSize: { xs: "1.375rem", sm: "1.5rem" },
                fontWeight: 700,
                color: "#34d399",
                mb: 1.5,
                margin: 0,
                padding: 0,
                lineHeight: 1.2,
                fontFamily:
                  "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {sectionHeading}
            </Box>
            <Box
              component="p"
              sx={{
                color: "#ffffff",
                fontSize: { xs: "0.9375rem", sm: "1rem" },
                margin: 0,
                padding: 0,
                lineHeight: 1.5,
                opacity: 0.9,
                px: { xs: 1, sm: 2 },
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {sectionSubtitle}
            </Box>
          </Box>

          {/* Swiper carousel */}
          <Box
            sx={{
              width: "100%",
              overflow: "visible",
              position: "relative",
              "& .swiper": {
                width: "100%",
                overflow: "visible",
              },
              "& .swiper-wrapper": {
                alignItems: "stretch",
              },
              "& .swiper-slide": {
                height: "auto",
                display: "flex",
                boxSizing: "border-box",
              },
              "& .swiper-pagination": {
                bottom: "0px",
                position: "relative",
                mt: 3,
                mb: 1,
              },
              "& .swiper-pagination-bullet": {
                background: "transparent",
                border: "2px solid #29C480",
                opacity: 0.5,
                width: "10px",
                height: "10px",
                margin: "0 4px",
              },
              "& .swiper-pagination-bullet-active": {
                background: "#29C480",
                opacity: 1,
              },
            }}
          >
            <Swiper
              modules={[Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              pagination={{ clickable: true }}
              style={{ 
                paddingBottom: "32px",
                width: "100%",
                overflow: "visible",
              }}
            >
              {features.map((feature) => (
                <SwiperSlide key={feature.id} style={{ width: "100%" }}>
                  <Box sx={{ width: "100%", height: "100%" }}>
                    <FeatureCardMobile feature={feature} />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default FeaturesMobile;
