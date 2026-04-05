"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { Feature, Plan } from "./types";
import { formatPlanNameForDisplay } from "@/presentation/@shared/helpers/plan-display";

type Props = {
  plans: Plan[];
  features: Feature[];
  ctaLabel: string;
  onOpenPlan: (index: number) => void;
};

const PlansDesktop: React.FC<Props> = ({ plans, features, ctaLabel, onOpenPlan }) => {
  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        "&::-webkit-scrollbar": {
          height: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(41, 196, 128, 0.3)",
          borderRadius: "4px",
          "&:hover": {
            background: "rgba(41, 196, 128, 0.5)",
          },
        },
      }}
    >
      <Box
        component="table"
        sx={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          minWidth: "800px",
          overflow: "visible",
        }}
      >
        {/* Header */}
        <Box component="thead">
          <Box component="tr">
            <Box
              component="th"
              sx={{
                padding: { xs: 1.5, md: 2 },
                textAlign: "left",
                borderBottom: "2px solid rgba(41, 196, 128, 0.2)",
                position: "sticky",
                left: 0,
                zIndex: 10,
                backgroundColor: "#080808",
                transition: "all 0.3s ease",
                width: "12.5%",
                maxWidth: "200px",
                "&:hover": {
                  backgroundColor: "rgba(41, 196, 128, 0.08)",
                  borderBottom: "2px solid rgba(41, 196, 128, 0.4)",
                },
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  transition: "color 0.3s ease",
                  "tr:hover &": {
                    color: "rgba(255, 255, 255, 0.9)",
                  },
                }}
              >
                Características
              </Typography>
            </Box>
            {plans.map((plan) => (
              <Box
                key={plan.name}
                component="th"
                sx={{
                  padding: { xs: "24px 16px 16px", md: "32px 24px 24px" },
                  paddingTop: plan.label ? { xs: "32px", md: "40px" } : { xs: 2, md: 3 },
                  textAlign: "center",
                  borderBottom: "2px solid rgba(41, 196, 128, 0.2)",
                  position: "relative",
                  backgroundColor: plan.label ? "rgba(41, 196, 128, 0.03)" : "#080808",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  overflow: "visible",
                  ...(plan.label && {
                    animation: "pulseGreen 3s ease-in-out infinite",
                    "@keyframes pulseGreen": {
                      "0%, 100%": {
                        backgroundColor: "rgba(41, 196, 128, 0.03)",
                        boxShadow: "inset 0 0 20px rgba(41, 196, 128, 0)",
                      },
                      "50%": {
                        backgroundColor: "rgba(41, 196, 128, 0.08)",
                        boxShadow: "inset 0 0 30px rgba(41, 196, 128, 0.15)",
                      },
                    },
                  }),
                  "&:hover": {
                    backgroundColor: plan.label ? "rgba(41, 196, 128, 0.12)" : "rgba(41, 196, 128, 0.08)",
                    borderBottom: "2px solid rgba(41, 196, 128, 0.4)",
                  },
                }}
              >
                {plan.label && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "#34d399",
                      color: "#000000",
                      padding: "2px 6px",
                      borderRadius: "8px",
                      fontSize: "0.5rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.2px",
                      whiteSpace: "nowrap",
                      boxShadow: "none",
                      zIndex: 20,
                      transition: "all 0.3s ease",
                      "th:hover &": {
                        transform: "translateX(-50%) scale(1.05)",
                      },
                    }}
                  >
                    {plan.label}
                  </Box>
                )}
                <Typography
                  variant="h6"
                  sx={{
                    color: "#ffffff",
                    fontWeight: 700,
                    mb: 1,
                    fontSize: { xs: "1rem", md: "1.25rem" },
                  }}
                >
                  {formatPlanNameForDisplay(plan.name)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#34d399",
                    fontWeight: 600,
                    fontSize: { xs: "0.875rem", md: "1rem" },
                  }}
                >
                  {plan.price}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Body */}
        <Box component="tbody">
          {features.map((feature, featureIndex) => (
            <Box
              key={feature.name}
              component="tr"
              sx={{
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: "rgba(41, 196, 128, 0.08)",
                  "& td": {
                    borderBottom: "1px solid rgba(41, 196, 128, 0.2)",
                  },
                  "& td:first-of-type": {
                    borderRight: "2px solid rgba(41, 196, 128, 0.2)",
                  },
                },
              }}
            >
              <Box
                component="td"
                sx={{
                  padding: { xs: 1.5, md: 2 },
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRight: "1px solid rgba(255, 255, 255, 0.05)",
                  position: "sticky",
                  left: 0,
                  zIndex: 5,
                  backgroundColor: "#080808",
                  transition: "all 0.3s ease",
                  width: "12.5%",
                  maxWidth: "200px",
                  "tr:hover &": {
                    backgroundColor: "rgba(41, 196, 128, 0.1)",
                    color: "#34d399",
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "#ffffff",
                    fontWeight: 500,
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    transition: "color 0.3s ease",
                    "tr:hover &": {
                      color: "#34d399",
                      fontWeight: 600,
                    },
                  }}
                >
                  {feature.name}
                </Typography>
              </Box>
              {plans.map((plan, planIndex) => {
                const value = feature.values[planIndex];
                const isRecommended = plan.label === "RECOMENDADO";
                return (
                  <Box
                    key={`${plan.name}-${featureIndex}`}
                    component="td"
                    sx={{
                      padding: { xs: 2, md: 3 },
                      textAlign: "center",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      transition: "all 0.3s ease",
                      width: "1%",
                      whiteSpace: "nowrap",
                      backgroundColor: isRecommended ? "rgba(41, 196, 128, 0.03)" : "transparent",
                      ...(isRecommended && {
                        animation: "pulseGreen 3s ease-in-out infinite",
                        "@keyframes pulseGreen": {
                          "0%, 100%": {
                            backgroundColor: "rgba(41, 196, 128, 0.03)",
                          },
                          "50%": {
                            backgroundColor: "rgba(41, 196, 128, 0.08)",
                          },
                        },
                      }),
                    }}
                  >
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: { xs: 24, md: 28 },
                        height: { xs: 24, md: 28 },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {value === true ? (
                        <CheckCircle
                          sx={{
                            color: "#34d399",
                            fontSize: { xs: 24, md: 28 },
                            transition: "all 0.3s ease",
                            "tr:hover &": {
                              filter: "drop-shadow(0 0 8px rgba(52, 211, 153, 0.6)) brightness(1.2)",
                            },
                          }}
                        />
                      ) : value === false ? (
                        <Cancel
                          sx={{
                            color: "rgba(255, 255, 255, 0.3)",
                            fontSize: { xs: 24, md: 28 },
                            transition: "all 0.3s ease",
                            "tr:hover &": {
                              opacity: 0.5,
                            },
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#ffffff",
                            fontSize: { xs: "0.875rem", md: "1rem" },
                            transition: "all 0.3s ease",
                            "tr:hover &": {
                              color: "#34d399",
                              fontWeight: 600,
                            },
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
          ))}

          {/* CTA Row */}
          <Box
            component="tr"
            sx={{
              "&:hover": {
                backgroundColor: "rgba(41, 196, 128, 0.03)",
              },
              transition: "background-color 0.3s ease",
            }}
          >
            <Box
              component="td"
              sx={{
                padding: { xs: 1.5, md: 2 },
                borderBottom: "none",
                position: "sticky",
                left: 0,
                zIndex: 5,
                backgroundColor: "#080808",
                width: "12.5%",
                maxWidth: "200px",
              }}
            />
            {plans.map((plan, planIndex) => {
              const isRecommended = plan.label === "RECOMENDADO";
              return (
              <Box
                key={`cta-${plan.name}`}
                component="td"
                sx={{
                  padding: { xs: 2, md: 3 },
                  textAlign: "center",
                  borderBottom: "none",
                  transition: "all 0.3s ease",
                  backgroundColor: isRecommended ? "rgba(41, 196, 128, 0.03)" : "transparent",
                  ...(isRecommended && {
                    animation: "pulseGreen 3s ease-in-out infinite",
                    "@keyframes pulseGreen": {
                      "0%, 100%": {
                        backgroundColor: "rgba(41, 196, 128, 0.03)",
                      },
                      "50%": {
                        backgroundColor: "rgba(41, 196, 128, 0.08)",
                      },
                    },
                  }),
                }}
              >
                <Box
                  component="button"
                  onClick={() => onOpenPlan(planIndex)}
                  sx={{
                    width: "100%",
                    maxWidth: "200px",
                    backgroundColor: "rgba(41, 196, 128, 0.1)",
                    border: "2px solid rgba(41, 196, 128, 0.3)",
                    color: "#34d399",
                    fontWeight: 600,
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.2)",
                      borderColor: "rgba(41, 196, 128, 0.6)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {ctaLabel}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.5)",
                    mt: 1,
                    fontSize: "0.75rem",
                  }}
                >
                  Más información
                </Typography>
              </Box>
            );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PlansDesktop;
