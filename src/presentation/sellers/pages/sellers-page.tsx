"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { PersonAdd, Assignment, Settings, RocketLaunch, ArrowForward } from '@mui/icons-material';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { AnimatedSection } from '@/presentation/@shared/components/ui/atoms/animated-section';
import PlansGrid from '../components/plans-grid/plans-grid';
import { plansData } from '@/presentation/@shared/components/ui/molecules/plan-card/plans-data';
import CompactTestimonialsCarousel from "@/presentation/sellers/components/compact-testimonials-carousel/compact-testimonials-carousel";
import SellersLandingVideo from "@/presentation/sellers/components/sellers-landing-video";
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { useModal } from '@/presentation/@shared/hooks/use-modal';
import PlanDetailContent from '../components/plan-detail-content/plan-detail-content';
import { SellerHero } from '@/presentation/@shared/components/ui/molecules/seller-hero';
import Features from '@/presentation/@shared/components/ui/molecules/features';
import useDevice from '@/presentation/@shared/hooks/use-device';
import HeroMobile from '@/presentation/@shared/components/ui/molecules/hero/hero-mobile';
import HeroDesktop from '@/presentation/@shared/components/ui/molecules/hero/hero-desktop';

const testimonialSlides = [
  {
    id: 1,
    image: "/rinaldi.svg",
    title: "Paula Rinaldi - Influencer Digital",
    description: "Hace unos meses vendo mis servicios en Liberty y ya pude realizar mis primeras ventas en criptomonedas de forma segura. Un cliente me envió bitcoin desde Italia y recibí el 100% del dinero tanto en pesos como en criptomonedas a través de la pasarela de pagos de liberty. Nunca antes había ganado el 100% y mucho menos recibiendo dinero desde otros países. Me encanta liberty.",
    rating: 5
  },
  {
    id: 2,
    image: "/smart.svg",
    title: "SmartCell Banda - Tienda de Celulares",
    description: "Importo celulares y los vendo en mi local. En el primer mes de publicidad con un poco de intriga, me interesaba principalmente que mi inversión minimamente se cubra. Desde que se activo mi tienda recibí unas 10 consultas diarias y logramos recuperar el 100% de la inversión.",
    rating: 5
  },
  {
    id: 3,
    image: "/cecilia.svg",
    title: "Cecilia Casenave - Fotógrafa en Estudio Móvil",
    description: "Trabajar con Liberty Club fue una gran decisión. Gestionan mis campañas, atienden las consultas y concretan ventas con profesionalismo, transmitiendo la esencia de mi marca. Gracias a su acompañamiento puedo enfocarme en crear, sabiendo que la parte comercial está en buenas manos. Los recomiendo para quienes quieran crecer.",
    rating: 5
  },
];

const SellersPage: React.FC = () => {
  const { t } = useLanguage();
  const { isMobile } = useDevice();
  const { openModal } = useModal();
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const isPausedRef = useRef(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const currentStepRef = useRef<number | null>(null);
  const stepStartTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(0);
  const stepPhaseRef = useRef<'step' | 'transition' | 'pause'>('step');

  const handleOpenPlan = useCallback((index: number) => {
    const selectedPlan = plansData[index];
    openModal(
      <PlanDetailContent plan={selectedPlan} />,
      {
        maxWidth: 'md',
      }
    );
  }, [openModal]);


  // Función para limpiar todos los timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  }, []);

  // Función para continuar la secuencia desde un paso específico
  const continueSequence = useCallback((startFrom: number | null, remainingTime: number = 0, phase: 'step' | 'transition' | 'pause' = 'step') => {
    if (isPausedRef.current) return;

    const stepDuration = 1000;
    const transitionDuration = 800;
    const pauseAfterStep4 = 2000;

    if (phase === 'transition' && startFrom === 3) {
      // Estamos en la transición del paso 4
      stepPhaseRef.current = 'transition';
      const timeout = setTimeout(() => {
        if (!isPausedRef.current) {
          setActiveStepIndex(null);
          currentStepRef.current = null;
          stepPhaseRef.current = 'pause';
          stepStartTimeRef.current = Date.now();
          const timeout2 = setTimeout(() => {
            if (!isPausedRef.current) {
              // Reiniciar desde el paso 1 con tiempo completo
              currentStepRef.current = 0;
              stepPhaseRef.current = 'step';
              setActiveStepIndex(0);
              stepStartTimeRef.current = Date.now();
              const timeout3 = setTimeout(() => {
                if (!isPausedRef.current) {
                  continueSequence(1, stepDuration);
                }
              }, stepDuration);
              timeoutsRef.current.push(timeout3);
            }
          }, pauseAfterStep4);
          timeoutsRef.current.push(timeout2);
        }
      }, remainingTime);
      timeoutsRef.current.push(timeout);
      return;
    }

    if (phase === 'pause' && startFrom === null) {
      // Estamos en la pausa después del paso 4
      stepPhaseRef.current = 'pause';
      stepStartTimeRef.current = Date.now();
      const timeout = setTimeout(() => {
        if (!isPausedRef.current) {
          // Reiniciar desde el paso 1 con tiempo completo
          currentStepRef.current = 0;
          stepPhaseRef.current = 'step';
          setActiveStepIndex(0);
          stepStartTimeRef.current = Date.now();
          const timeout2 = setTimeout(() => {
            if (!isPausedRef.current) {
              continueSequence(1, stepDuration);
            }
          }, stepDuration);
          timeoutsRef.current.push(timeout2);
        }
      }, remainingTime);
      timeoutsRef.current.push(timeout);
      return;
    }

    // Paso normal
    const step = startFrom ?? 0;
    stepPhaseRef.current = 'step';
    setActiveStepIndex(step);
    currentStepRef.current = step;
    stepStartTimeRef.current = Date.now();

    const timeout = setTimeout(() => {
      if (!isPausedRef.current) {
        if (step === 0) {
          continueSequence(1, stepDuration);
        } else if (step === 1) {
          continueSequence(2, stepDuration);
        } else if (step === 2) {
          continueSequence(3, stepDuration);
        } else if (step === 3) {
          // Iniciar transición del paso 4
          continueSequence(3, transitionDuration, 'transition');
        }
      }
    }, remainingTime);
    timeoutsRef.current.push(timeout);
  }, []);

  // Handlers para pausar/reanudar
  const handleMouseEnter = useCallback(() => {
    isPausedRef.current = true;

    // Calcular el tiempo restante del paso/fase actual
    if (stepStartTimeRef.current > 0) {
      const elapsed = Date.now() - stepStartTimeRef.current;
      const stepDuration = 1000;
      const transitionDuration = 800;
      const pauseAfterStep4 = 2000;

      if (stepPhaseRef.current === 'step') {
        remainingTimeRef.current = Math.max(0, stepDuration - elapsed);
      } else if (stepPhaseRef.current === 'transition') {
        remainingTimeRef.current = Math.max(0, transitionDuration - elapsed);
      } else if (stepPhaseRef.current === 'pause') {
        remainingTimeRef.current = Math.max(0, pauseAfterStep4 - elapsed);
      }
    }

    clearAllTimeouts();
  }, [clearAllTimeouts]);

  const handleMouseLeave = useCallback(() => {
    isPausedRef.current = false;

    // Continuar desde el paso/fase actual con el tiempo restante
    const currentStep = currentStepRef.current;
    const remaining = remainingTimeRef.current;
    const phase = stepPhaseRef.current;

    clearAllTimeouts();

    if (phase === 'pause') {
      // Si estamos en la pausa después del paso 4, continuar desde ahí
      continueSequence(null, remaining, 'pause');
    } else if (phase === 'transition') {
      // Si estamos en la transición del paso 4, continuar desde ahí
      continueSequence(3, remaining, 'transition');
    } else {
      // Paso normal, continuar desde el paso actual
      continueSequence(currentStep !== null ? currentStep : 0, remaining, phase);
    }
  }, [clearAllTimeouts, continueSequence]);

  // Efecto de secuencia para las tarjetas de pasos
  useEffect(() => {
    if (!isPausedRef.current) {
      clearAllTimeouts();
      continueSequence(0);
    }

    return () => {
      clearAllTimeouts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  // Slide específico para sellers: "Hacé crecer tu negocio sin fronteras"
  const sellerHeroSlide = t.home?.heroSlides?.[2] || {
    title: "Hacé crecer tu negocio sin fronteras",
    subtitle: "Vendé y cobrá con libertad",
    description: "Desde cualquier parte del mundo. Expandí tu comercio globalmente con total libertad financiera.",
    primaryCta: "Empezar ahora",
    secondaryCta: "Conocer más"
  };

  // Render Hero con solo el slide específico
  const SellerHeroSection = () => {
    const slides = [sellerHeroSlide];
    if (isMobile) {
      return <HeroMobile slides={slides} />;
    }
    return <HeroDesktop slides={slides} />;
  };

  return (
    <MainLayout>
      <SellerHeroSection />
      <Features />

      <SellerHero />
      {/* Selling Steps Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          backgroundColor: '#000000',
          position: 'relative'
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: { xs: 4, md: 6 },
              gap: 2
            }}
          >
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: "1.25rem", md: "3rem" },
                fontWeight: 700,
                color: "#34d399",
                margin: 0,
                padding: 0,
                lineHeight: 1.2,
                textAlign: 'center',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {t.sellers.sellFastEasy}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1rem", md: "1.125rem" },
                fontWeight: 400,
                color: "#ffffff",
                margin: 0,
                padding: 0,
                lineHeight: 1.4,
                maxWidth: "600px",
                mx: "auto",
                opacity: 0.9,
                textAlign: 'center'
              }}
            >
              {t.sellers.createStoreSteps}
            </Typography>
          </Box>

          {/* Steps Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: { xs: 3, md: 4 },
              position: 'relative',
              width: '100%'
            }}
          >
            {[
              {
                icon: PersonAdd,
                text: t.sellers.loginOrRegister,
                step: 1
              },
              {
                icon: Assignment,
                text: t.sellers.choosePlan,
                step: 2
              },
              {
                icon: Settings,
                text: t.sellers.configureStore,
                step: 3
              },
              {
                icon: RocketLaunch,
                text: t.sellers.startSelling,
                step: 4
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              const isActive = activeStepIndex === index;
              return (
                <Box
                  key={index}
                  className="step-card"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  sx={{
                    position: 'relative',
                    background: isActive
                      ? `
                        radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.08) 50%),
                        radial-gradient(ellipse 200px 150px at 70% 30%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 40%, rgba(255, 255, 255, 0.06) 70%)
                      `
                      : `
                      radial-gradient(circle at 30% 70%, rgba(34, 197, 94, 0.15) 0%, rgba(41, 196, 128, 0.1) 30%, rgba(16, 185, 129, 0.08) 50%),
                      radial-gradient(ellipse 200px 150px at 70% 30%, rgba(34, 197, 94, 0.12) 0%, rgba(41, 196, 128, 0.08) 40%, rgba(16, 185, 129, 0.06) 70%)
                    `,
                    border: isActive
                      ? "2px solid rgba(255, 255, 255, 0.5)"
                      : "2px solid rgba(41, 196, 128, 0.2)",
                    borderRadius: "16px",
                    p: { xs: 3, md: 4 },
                    overflow: "visible",
                    cursor: "pointer",
                    transition: "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    transform: isActive ? "translateY(-8px)" : "translateY(0)",
                    boxShadow: "none",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      background: isActive
                        ? `
                          radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.2) 30%, rgba(255, 255, 255, 0.15) 50%),
                          radial-gradient(ellipse 200px 150px at 70% 30%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.18) 40%, rgba(255, 255, 255, 0.12) 70%)
                        `
                        : `
                        radial-gradient(circle at 30% 70%, rgba(34, 197, 94, 0.25) 0%, rgba(41, 196, 128, 0.2) 30%, rgba(16, 185, 129, 0.15) 50%),
                        radial-gradient(ellipse 200px 150px at 70% 30%, rgba(34, 197, 94, 0.22) 0%, rgba(41, 196, 128, 0.18) 40%, rgba(16, 185, 129, 0.12) 70%)
                      `,
                      borderColor: isActive
                        ? "rgba(255, 255, 255, 0.7)"
                        : "rgba(41, 196, 128, 0.5)",
                      boxShadow: "none",
                      "& .arrow-connector svg": {
                        color: "rgba(41, 196, 128, 0.8)",
                        transform: "translateX(4px)"
                      }
                    }
                  }}
                >
                  {/* Blur effect */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: isActive ? 150 : 120,
                      height: isActive ? 150 : 120,
                      backgroundColor: isActive
                        ? "rgba(255, 255, 255, 0.2)"
                        : "rgba(41, 196, 128, 0.1)",
                      borderRadius: "50%",
                      filter: "blur(40px)",
                      zIndex: 0,
                      transition: "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      ".step-card:hover &": {
                        width: 150,
                        height: 150,
                        backgroundColor: isActive
                          ? "rgba(255, 255, 255, 0.2)"
                          : "rgba(41, 196, 128, 0.2)"
                      }
                    }}
                  />

                  {/* Content */}
                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: 2
                    }}
                  >
                    {/* Step Number */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -12,
                        right: -12,
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: isActive
                          ? "rgba(255, 255, 255, 0.2)"
                          : "linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(41, 196, 128, 0.8))",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "1.125rem",
                        color: isActive ? "#ffffff" : "#ffffff",
                        boxShadow: "none",
                        transition: "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        transform: isActive ? "scale(1.15) rotate(5deg)" : "scale(1)",
                        ".step-card:hover &": {
                          transform: "scale(1.15) rotate(5deg)",
                          boxShadow: "none"
                        }
                      }}
                    >
                      {item.step}
                    </Box>

                    {/* Icon */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: { xs: 64, md: 80 },
                        height: { xs: 64, md: 80 },
                        borderRadius: "50%",
                        background: isActive
                          ? "linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.25))"
                          : "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(41, 196, 128, 0.15))",
                        border: isActive
                          ? "2px solid rgba(255, 255, 255, 0.6)"
                          : "2px solid rgba(41, 196, 128, 0.3)",
                        mb: 1,
                        transition: "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        transform: isActive ? "scale(1.1) rotate(5deg)" : "scale(1)",
                        ".step-card:hover &": {
                          transform: "scale(1.1) rotate(5deg)",
                          background: isActive
                            ? "linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.25))"
                            : "linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(41, 196, 128, 0.25))",
                          borderColor: isActive
                            ? "rgba(255, 255, 255, 0.7)"
                            : "rgba(41, 196, 128, 0.5)"
                        }
                      }}
                    >
                      <IconComponent
                        sx={{
                          fontSize: { xs: 32, md: 40 },
                          color: isActive ? "#ffffff" : "#34d399",
                          transition: "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                          transform: isActive ? "scale(1.1)" : "scale(1)",
                          ".step-card:hover &": {
                            color: isActive ? "#ffffff" : "#ffffff",
                            transform: "scale(1.1)"
                          }
                        }}
                      />
                    </Box>

                    {/* Text */}
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "1rem", md: "1.125rem" },
                        color: isActive ? "#ffffff" : "#34d399",
                        fontWeight: 500,
                        lineHeight: 1.5,
                        transition: "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        transform: isActive ? "translateY(-2px)" : "translateY(0)",
                        ".step-card:hover &": {
                          transform: "translateY(-2px)",
                          color: "#ffffff"
                        }
                      }}
                    >
                      {item.text}
                    </Typography>
                  </Box>

                  {/* Arrow connector (only on desktop, between cards) */}
                  {index < 3 && (
                    <Box
                      className="arrow-connector"
                      sx={{
                        display: { xs: "none", md: "flex" },
                        position: "absolute",
                        top: "50%",
                        left: { md: "calc(100% + 16px)", lg: "calc(100% + 16px)" },
                        transform: "translate(-50%, -50%)",
                        zIndex: 2,
                        pointerEvents: "none",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <ArrowForward
                        sx={{
                          fontSize: 32,
                          color: "rgba(41, 196, 128, 0.4)",
                          transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        }}
                      />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Container>
      </Box>

      {/* Plans Section */}
      <Box sx={{ width: "100%", position: "relative" }}>
        {/* Línea separadora arriba */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: 'linear-gradient(90deg, transparent 0%, transparent 5%, #29C480 25%, #29C480 75%, transparent 95%, transparent 100%)',
            boxShadow: '0 0 20px rgba(41, 196, 128, 0.5), 0 0 40px rgba(41, 196, 128, 0.2), inset 0 0 15px rgba(41, 196, 128, 0.15)',
            borderRadius: '9999px',
            zIndex: 10
          }}
        />
        <Box
          component="section"
          sx={{
            py: { xs: 5, md: 20 },
            pt: { xs: 8, md: 24 },
            backgroundColor: '#000000',
            position: 'relative',
            borderTop: "1px solid rgba(41, 196, 128, 0.05)",
            overflow: 'hidden',
            background: `
              radial-gradient(ellipse 1400px 800px at 50% 30%, #0a2820 0%, #000000 70%),
              radial-gradient(circle at 15% 80%, #1a1a1a 0%, #000000 60%),
              radial-gradient(ellipse 900px 700px at 85% 60%, #0a1a15 0%, #000000 65%)
            `,
            '&::before': {
              content: '""',
              position: 'absolute',
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
              backgroundSize: '6px 6px, 6px 6px',
              opacity: 0.9,
              zIndex: 1,
              pointerEvents: 'none'
            },
            '&::after': {
              content: '""',
              position: 'absolute',
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
              backgroundSize: '3px 3px',
              opacity: 0.7,
              zIndex: 1,
              pointerEvents: 'none',
              mixBlendMode: 'overlay'
            }
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 }, position: "relative", zIndex: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4,
                gap: 2
              }}
            >
              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: "1.25rem", md: "3rem" },
                  fontWeight: 700,
                  color: "#34d399",
                  margin: 0,
                  marginBottom: { xs: 2, md: 3 },
                  padding: 0,
                  lineHeight: 1.2,
                  textAlign: 'center',
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {t.sellers.idealForBusiness}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "1rem", md: "1.25rem" },
                  fontWeight: 400,
                  color: "#ffffff",
                  margin: 0,
                  padding: 0,
                  lineHeight: 1.4,
                  maxWidth: "600px",
                  mx: "auto",
                  opacity: 0.9,
                  textAlign: 'center'
                }}
              >
                {t.sellers.findBestPlan}
              </Typography>
            </Box>
            <AnimatedSection direction="down" delay={200}>
              <PlansGrid
                activeIndex={currentPlanIndex}
                onSelectPlan={setCurrentPlanIndex}
                onOpenPlan={handleOpenPlan}
                ctaLabel={t.sellers.viewPlan} />
            </AnimatedSection>
          </Container>
        </Box>
      </Box>

      {/* Testimonials Section */}
      <Box
        component="section"
        sx={{
          py: 8,
          backgroundColor: '#080808',
          position: 'relative'
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
              gap: 2
            }}
          >
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: "1.25rem", md: "3rem" },
                fontWeight: 700,
                color: "#34d399",
                margin: 0,
                marginBottom: { xs: 2, md: 3 },
                padding: 0,
                lineHeight: 1.2,
                textAlign: 'center',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {t.sellers.experiences}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1rem", md: "1.25rem" },
                fontWeight: 400,
                color: "#ffffff",
                margin: 0,
                padding: 0,
                lineHeight: 1.4,
                maxWidth: "600px",
                mx: "auto",
                opacity: 0.9,
                textAlign: 'center'
              }}
            >
              {t.sellers.whatTheySay}
            </Typography>
          </Box>
          <CompactTestimonialsCarousel slides={testimonialSlides} />
        </Container>
      </Box>

      <SellersLandingVideo />
    </MainLayout>
  );
};

export default SellersPage;
