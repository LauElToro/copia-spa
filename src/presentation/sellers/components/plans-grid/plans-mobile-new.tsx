"use client";

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { Feature, Plan } from "./types";
import { formatPlanNameForDisplay } from "@/presentation/@shared/helpers/plan-display";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

type Props = {
  plans: Plan[];
  features: Feature[];
  activeIndex: number;
  ctaLabel: string;
  onSelectPlan: (index: number) => void;
  onOpenPlan: (index: number) => void;
};

const PlansMobileNew: React.FC<Props> = ({
  plans,
  features,
  activeIndex,
  ctaLabel,
  onSelectPlan,
  onOpenPlan,
}) => {
  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <Swiper
        modules={[Pagination]}
        spaceBetween={32}
        slidesPerView={1}
        pagination={{ clickable: true }}
        initialSlide={activeIndex}
        onSlideChange={(swiper) => onSelectPlan(swiper.activeIndex)}
        style={{ paddingBottom: 24 }}
      >
        {plans.map((plan, planIndex) => {
          const isRecommended = plan.label === "RECOMENDADO";
          return (
            <SwiperSlide key={plan.name}>
              <Box
                sx={{
                  backgroundColor: isRecommended
                    ? "rgba(41, 196, 128, 0.05)"
                    : "#080808",
                  borderRadius: "16px",
                  border: isRecommended
                    ? "2px solid rgba(41, 196, 128, 0.3)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                  padding: 3,
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  ...(isRecommended && {
                    animation: "pulseGreen 3s ease-in-out infinite",
                    "@keyframes pulseGreen": {
                      "0%, 100%": {
                        backgroundColor: "rgba(41, 196, 128, 0.05)",
                        boxShadow: "0 0 20px rgba(41, 196, 128, 0)",
                      },
                      "50%": {
                        backgroundColor: "rgba(41, 196, 128, 0.1)",
                        boxShadow: "0 0 30px rgba(41, 196, 128, 0.2)",
                      },
                    },
                  }),
                }}
              >
                {/* Recommended Badge */}
                {plan.label && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      backgroundColor: "#34d399",
                      color: "#000000",
                      padding: "4px 12px",
                      borderRadius: "8px",
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      zIndex: 10,
                    }}
                  >
                    {plan.label}
                  </Box>
                )}

                {/* Plan Header */}
                <Box
                  sx={{
                    textAlign: "center",
                    mb: 3,
                    pt: plan.label ? 1 : 0,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#ffffff",
                      fontWeight: 700,
                      mb: 1,
                      fontSize: "1.25rem",
                    }}
                  >
                    {formatPlanNameForDisplay(plan.name)}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#34d399",
                      fontWeight: 600,
                      fontSize: "1.125rem",
                    }}
                  >
                    {plan.price}
                  </Typography>
                </Box>

                {/* Divider */}
                <Box
                  sx={{
                    width: "100%",
                    height: "1px",
                    backgroundColor: "rgba(41, 196, 128, 0.2)",
                    mb: 3,
                  }}
                />

                {/* Features List */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                    mb: 3,
                  }}
                >
                  {features.map((feature) => {
                    const value = feature.values[planIndex];
                    return (
                      <Box
                        key={`${plan.name}-${feature.name}`}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 16px",
                          backgroundColor: "rgba(255, 255, 255, 0.02)",
                          borderRadius: "8px",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "rgba(41, 196, 128, 0.08)",
                          },
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#ffffff",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            flex: 1,
                          }}
                        >
                          {feature.name}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 32,
                            height: 32,
                          }}
                        >
                          {value === true ? (
                            <CheckCircle
                              sx={{
                                color: "#34d399",
                                fontSize: 28,
                              }}
                            />
                          ) : value === false ? (
                            <Cancel
                              sx={{
                                color: "rgba(255, 255, 255, 0.3)",
                                fontSize: 28,
                              }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#ffffff",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                              }}
                            >
                              {String(value)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                {/* CTA Button */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <Button
                    onClick={() => onOpenPlan(planIndex)}
                    fullWidth
                    sx={{
                      backgroundColor: "rgba(41, 196, 128, 0.1)",
                      border: "2px solid rgba(41, 196, 128, 0.3)",
                      color: "#34d399",
                      fontWeight: 600,
                      padding: "14px 24px",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontSize: "0.875rem",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(41, 196, 128, 0.2)",
                        borderColor: "rgba(41, 196, 128, 0.6)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(41, 196, 128, 0.2)",
                      },
                    }}
                  >
                    {ctaLabel}
                  </Button>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.5)",
                      textAlign: "center",
                      fontSize: "0.75rem",
                    }}
                  >
                    Más información
                  </Typography>
                </Box>
              </Box>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </Box>
  );
};

export default PlansMobileNew;
