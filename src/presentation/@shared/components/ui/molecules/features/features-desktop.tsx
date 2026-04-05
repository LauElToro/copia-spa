"use client";

import React, { useRef, useEffect, useState } from "react";
import { Box, Container } from "@mui/material";

interface Feature {
  id: string;
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  title: string;
  description: string;
}

interface FeaturesDesktopProps {
  features: Feature[];
  sectionHeading: string;
  sectionSubtitle: string;
}

const UsersIcon = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard = ({ feature }: FeatureCardProps) => {
  const Icon = feature.icon;
  const cardRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (cardRef.current) {
      const updateDimensions = () => {
        if (cardRef.current) {
          setDimensions({
            width: cardRef.current.offsetWidth,
            height: cardRef.current.offsetHeight,
          });
        }
      };
      updateDimensions();
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }
  }, []);

  return (
    <Box sx={{ width: "100%", display: "block" }}>
      <Box
        ref={cardRef}
        className="group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(41, 196, 128, 0.05)",
          minHeight: { xs: "390px", md: "400px" },
          width: "100%",
          boxShadow: "inset 0 0 1px rgba(41, 196, 128, 0.02)",
          display: "block",
          visibility: "visible",
          opacity: 1,
          zIndex: 1,
          transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          cursor: "pointer",
          transform: isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
          "&:hover": {
            borderColor: "rgba(41, 196, 128, 0.25)",
            boxShadow: `
              0 20px 40px rgba(41, 196, 128, 0.15),
              inset 0 0 1px rgba(41, 196, 128, 0.1)
            `,
            "& svg line": {
              opacity: 0.3,
              stroke: "#29C480",
              strokeWidth: "1",
            },
            "& .corner-icon": {
              opacity: 0.6,
              transform: "scale(1.1)",
              color: "#29C480",
            },
            "& .blur-effect-1": {
              opacity: 0.15,
              transform: "scale(1.2)",
            },
            "& .blur-effect-2": {
              opacity: 0.2,
              transform: "scale(1.3)",
            },
          },
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
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.3,
            background: `
              radial-gradient(circle at 30% 40%, #0a2820 0%, transparent 50%),
              radial-gradient(ellipse at 70% 70%, #1a1a1a 0%, transparent 60%)
            `,
          }}
        />

        {/* Corner user icons */}
        <Box
          className="corner-icon"
          sx={{
            position: "absolute",
            top: { xs: 16, md: 32 },
            left: { xs: 16, md: 32 },
            zIndex: 10,
            color: isHovered ? "#29C480" : "#64748b",
            opacity: isHovered ? 0.6 : 0.2,
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          <UsersIcon />
        </Box>
        <Box
          className="corner-icon"
          sx={{
            position: "absolute",
            top: { xs: 16, md: 32 },
            right: { xs: 16, md: 32 },
            zIndex: 10,
            color: isHovered ? "#29C480" : "#64748b",
            opacity: isHovered ? 0.6 : 0.2,
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          <UsersIcon />
        </Box>
        <Box
          className="corner-icon"
          sx={{
            position: "absolute",
            bottom: { xs: 16, md: 32 },
            left: { xs: 16, md: 32 },
            zIndex: 10,
            color: isHovered ? "#29C480" : "#64748b",
            opacity: isHovered ? 0.6 : 0.2,
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          <UsersIcon />
        </Box>
        <Box
          className="corner-icon"
          sx={{
            position: "absolute",
            bottom: { xs: 16, md: 32 },
            right: { xs: 16, md: 32 },
            zIndex: 10,
            color: isHovered ? "#29C480" : "#64748b",
            opacity: isHovered ? 0.6 : 0.2,
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          <UsersIcon />
        </Box>

        {/* Corner lines */}
        {dimensions.width > 0 && dimensions.height > 0 ? (
          <Box
            component="svg"
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 5,
              "& line": {
                strokeDasharray: "4, 4",
                transition: "opacity 0.5s ease",
                opacity: 0.1,
              },
            }}
            preserveAspectRatio="none"
            viewBox={`0 0 ${dimensions.width || 400} ${dimensions.height || 400}`}
          >
            <line
              x1="32"
              y1="32"
              x2={(dimensions.width || 400) / 2}
              y2={(dimensions.height || 400) / 2}
              stroke="#29C480"
              strokeWidth="0.5"
            />
            <line
              x1={(dimensions.width || 400) - 32}
              y1="32"
              x2={(dimensions.width || 400) / 2}
              y2={(dimensions.height || 400) / 2}
              stroke="#29C480"
              strokeWidth="0.5"
            />
            <line
              x1="32"
              y1={(dimensions.height || 400) - 32}
              x2={(dimensions.width || 400) / 2}
              y2={(dimensions.height || 400) / 2}
              stroke="#29C480"
              strokeWidth="0.5"
            />
            <line
              x1={(dimensions.width || 400) - 32}
              y1={(dimensions.height || 400) - 32}
              x2={(dimensions.width || 400) / 2}
              y2={(dimensions.height || 400) / 2}
              stroke="#29C480"
              strokeWidth="0.5"
            />
          </Box>
        ) : (
          <Box
            component="svg"
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 5,
              "& line": {
                strokeDasharray: "4, 4",
                transition: "opacity 0.5s ease",
                opacity: 0.1,
              },
            }}
            preserveAspectRatio="none"
            viewBox="0 0 400 400"
          >
            <line x1="32" y1="32" x2="200" y2="200" stroke="#29C480" strokeWidth="0.5" />
            <line x1="368" y1="32" x2="200" y2="200" stroke="#29C480" strokeWidth="0.5" />
            <line x1="32" y1="368" x2="200" y2="200" stroke="#29C480" strokeWidth="0.5" />
            <line x1="368" y1="368" x2="200" y2="200" stroke="#29C480" strokeWidth="0.5" />
          </Box>
        )}

        {/* Center icon */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Box
              className="blur-effect-1"
              sx={{
                position: "absolute",
                inset: 0,
                width: { xs: 67, md: 96 },
                height: { xs: 67, md: 96 },
                backgroundColor: "#29C480",
                borderRadius: "50%",
                filter: "blur(48px)",
                opacity: 0.05,
                transition: "opacity 0.5s ease",
              }}
            />
            <Box
              className="blur-effect-2"
              sx={{
                position: "absolute",
                inset: 0,
                width: { xs: 67, md: 96 },
                height: { xs: 67, md: 96 },
                backgroundColor: "#29C480",
                borderRadius: "50%",
                filter: "blur(16px)",
                opacity: 0.08,
                transition: "opacity 0.5s ease",
              }}
            />
            <Box
              sx={{
                width: { xs: 101, md: 144 },
                height: { xs: 101, md: 144 },
                borderRadius: "50%",
                background: "linear-gradient(to bottom right, #29C480, #1a9f67)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 10,
                boxShadow:
                  "0 0 15px rgba(41, 196, 128, 0.15), inset 0 0 15px rgba(255, 255, 255, 0.03)",
                "& svg": {
                  fontSize: { xs: "37px !important", md: "53px !important" },
                  color: "white",
                },
              }}
            >
              <Icon />
            </Box>
          </Box>
        </Box>

        {/* Hover Overlay with Centered Content */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 4, md: 6 },
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            pointerEvents: "none",
            zIndex: 30,
          }}
        >
          <Box
            component="h3"
            sx={{
              fontSize: { xs: "1.25rem", md: "1.5rem" },
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              marginBottom: 2,
              transform: isHovered ? "translateY(0)" : "translateY(20px)",
              opacity: isHovered ? 1 : 0,
              transition:
                "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s",
            }}
          >
            {feature.title}
          </Box>
          <Box
            component="p"
            sx={{
              color: "#e2e8f0",
              fontSize: { xs: "0.875rem", md: "0.95rem" },
              lineHeight: 1.6,
              textAlign: "center",
              margin: 0,
              padding: 0,
              maxWidth: "300px",
              transform: isHovered ? "translateY(0)" : "translateY(30px)",
              opacity: isHovered ? 1 : 0,
              transition:
                "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.4s",
            }}
          >
            {feature.description}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const FeaturesDesktop = ({ features, sectionHeading, sectionSubtitle }: FeaturesDesktopProps) => {
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
          py: { xs: 5, md: 20 },
          pt: { xs: 8, md: 24 },
          background: `
            radial-gradient(ellipse 1400px 800px at 50% 30%, #0a2820 0%, #000000 70%),
            radial-gradient(circle at 15% 80%, #1a1a1a 0%, #000000 60%),
            radial-gradient(ellipse 900px 700px at 85% 60%, #0a1a15 0%, #000000 65%)
          `,
          width: "100%",
          position: "relative",
          borderTop: "1px solid rgba(41, 196, 128, 0.05)",
          overflow: "hidden",
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
            backgroundSize: "6px 6px, 6px 6px",
            opacity: 0.9,
            zIndex: 0,
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
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
            backgroundSize: "3px 3px",
            opacity: 0.7,
            zIndex: 0,
            pointerEvents: "none",
            mixBlendMode: "overlay",
          },
        }}
      >
        <Container
          maxWidth="xl"
          sx={{ px: { xs: 4, sm: 6, lg: 8 }, position: "relative", zIndex: 1 }}
        >
          <Box sx={{ textAlign: "center", mb: { xs: 8, md: 12 } }}>
            <Box
              component="h2"
              sx={{
                fontSize: { xs: "1.5rem", md: "3rem" },
                fontWeight: 700,
                color: "#34d399",
                mb: { xs: 2, md: 3 },
                margin: 0,
                padding: 0,
                lineHeight: 1.2,
                fontFamily:
                  "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {sectionHeading}
            </Box>
            <Box
              component="p"
              sx={{
                color: "#ffffff",
                fontSize: "1.25rem",
                margin: 0,
                padding: 0,
                lineHeight: 1.4,
                opacity: 0.9,
              }}
            >
              {sectionSubtitle}
            </Box>
          </Box>

          {/* Desktop layout */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: 2, md: 6 },
              width: "100%",
              flexWrap: { xs: "wrap", md: "nowrap" },
              "& > *": {
                flex: { xs: "1 1 calc(50% - 16px)", md: "0 0 320px" },
                maxWidth: { xs: "calc(50% - 8px)", md: "320px" },
                minWidth: { xs: "calc(50% - 8px)", md: "320px" },
              },
            }}
          >
            {features.map((feature, i) => (
              <FeatureCard key={i} feature={feature} />
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default FeaturesDesktop;
