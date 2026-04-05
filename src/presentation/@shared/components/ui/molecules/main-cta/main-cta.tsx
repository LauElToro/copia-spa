"use client";

import React from "react";
import { Box, Button, Container } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import FooterLogo from "../../atoms/footer-logo/footer-logo";

interface GradientCTASectionProps {
  className?: string;
  title: string;
  buttonLabel: string;
  Illustration?: React.ReactNode;
  /** Para usar Container (home/cta) o Box (partners) */
  useContainer?: boolean;
}

const GradientCTASection: React.FC<GradientCTASectionProps> = ({
  className = "",
  title,
  buttonLabel,
  Illustration,
  useContainer = true,
}) => {
  const Wrapper: React.ElementType = useContainer ? Container : Box;

  const wrapperProps = useContainer
    ? {
        maxWidth: "xl",
        sx: { px: { xs: 0 } },
      }
    : {
        sx: { maxWidth: "100%", px: { xs: 0 } },
      };

  return (
    <Box
      component="section"
      className={className}
      sx={{
        py: { xs: -5, md: -15 },
        px: { xs: 0, sm: 0, lg: 0 },
        width: "100%",
        overflowX: "hidden",
        paddingTop: "4rem",
        paddingBottom: "4rem",
      }}
    >
      <Wrapper {...wrapperProps}>
        <Box
          className="card-container"
          sx={{
            position: "relative",
            background: `
              radial-gradient(circle at 30% 70%, rgba(25, 158, 74, 0.95) 0%, rgba(30, 163, 106, 0.9) 30%, rgba(14, 143, 107, 0.8) 50%),
              radial-gradient(ellipse 500px 400px at 70% 30%, rgba(25, 158, 74, 0.9) 0%, rgba(30, 163, 106, 0.85) 40%, rgba(14, 143, 107, 0.8) 70%)
            `,
            border: "2px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            p: { xs: 2.5, sm: 3, md: 4 },
            overflow: "hidden",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            cursor: "pointer",
            transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            "&:hover": {
              transform: "translateY(-12px)",
              borderColor: "rgba(255, 255, 255, 0.4)",
            },
          }}
        >
          {/* Blur effect */}
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

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: { xs: "block", md: "grid" },
              gridTemplateColumns: { md: "1fr 1fr" },
              gap: { xs: 3, md: 3 },
              alignItems: "center",
              width: "100%",
              transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              ".card-container:hover &": {
                transform: "translateY(-2px)",
              },
            }}
          >
            {/* Left content */}
            <Box sx={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
              <Box
                sx={{
                  mb: { xs: 3, md: 4 },
                  width: "100%",
                  maxWidth: "100%",
                  overflow: "hidden",
                  "& > div": {
                    width: "100%",
                    maxWidth: "100%",
                  },
                }}
              >
                <FooterLogo />
              </Box>

              <Box
                component="h2"
                sx={{
                  fontSize: { xs: "1.25rem", md: "3rem" },
                  fontWeight: 700,
                  color: "#ffffff",
                  mb: { xs: 4, md: 6 },
                  margin: 0,
                  padding: 0,
                  lineHeight: 1.2,
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  fontFamily:
                    "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  transition:
                    "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  ".card-container:hover &": {
                    transform: "translateX(8px)",
                  },
                }}
              >
                {title}
              </Box>

              <Button
                variant="outlined"
                sx={{
                  position: "relative",
                  px: { xs: 2, md: 4 },
                  py: { xs: 1, md: 2 },
                  border: "2px solid #ffffff",
                  color: "#ffffff",
                  fontWeight: 600,
                  borderRadius: "8px",
                  overflow: "hidden",
                  fontSize: "1.125rem",
                  textTransform: "none",
                  transition:
                    "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  ".card-container:hover &": {
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    borderColor: "#ffffff",
                    transform: "translateX(12px) scale(1.05)",
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {buttonLabel}
                  <ArrowForward sx={{ fontSize: 20 }} />
                </Box>
              </Button>
            </Box>

            {/* Right - SVG Illustration */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                transition:
                  "all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                ".card-container:hover &": {
                  transform: "translateY(-8px)",
                },
              }}
            >
              <Box
                sx={{
                  maxWidth: "100%",
                  height: "auto",
                  transition:
                    "all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  ".card-container:hover &": {
                    transform: "rotate(-2deg)",
                  },
                }}
              >
                {Illustration}
              </Box>
            </Box>
          </Box>
        </Box>
      </Wrapper>
    </Box>
  );
};

export default GradientCTASection;
