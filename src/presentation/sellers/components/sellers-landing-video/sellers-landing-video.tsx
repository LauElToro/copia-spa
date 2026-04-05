"use client";

import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";

/** Video promocional (embed); `start` en segundos equivale a &t= en YouTube */
const YOUTUBE_EMBED_SRC = "https://www.youtube.com/embed/i27_NDQuyvQ?start=190&rel=0";

export const SellersLandingVideo: React.FC = () => {
  const { t } = useLanguage();
  const sellers = t.sellers as Record<string, string | undefined>;
  const title = sellers.landingVideoTitle ?? "Mirá Liberty Club en video";
  const subtitle = sellers.landingVideoSubtitle ?? "";

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: "#000000",
        position: "relative",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "1.35rem", md: "2.25rem" },
              fontWeight: 700,
              color: "#34d399",
              mb: subtitle ? 1.5 : 0,
              lineHeight: 1.2,
              fontFamily:
                "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              sx={{
                fontSize: { xs: "0.95rem", md: "1.1rem" },
                color: "rgba(255,255,255,0.85)",
                maxWidth: 640,
                mx: "auto",
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 960,
            mx: "auto",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 0 0 1px rgba(52, 211, 153, 0.25), 0 24px 48px rgba(0,0,0,0.45)",
            aspectRatio: "16 / 9",
            bgcolor: "#0a0a0a",
          }}
        >
          <Box
            component="iframe"
            src={YOUTUBE_EMBED_SRC}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default SellersLandingVideo;
