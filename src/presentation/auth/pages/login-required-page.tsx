'use client';

import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import RestrictedHero from '@/presentation/@shared/components/ui/molecules/restricted-hero/restricted-hero';
const LoginRequiredPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const redirect = searchParams?.get('redirect') ?? undefined;

  const handleLogin = () => {
    const base = '/login';
    if (redirect) {
      router.push(`${base}?redirect=${encodeURIComponent(redirect)}`);
      return;
    }
    router.push(base);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/');
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <Box
        component="section"
        sx={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          height: "400px",
          boxSizing: "border-box",
background: `
  radial-gradient(circle at 30% 70%, rgba(36, 196, 128, 0.95) 0%, rgba(30, 159, 104, 0.9) 30%, rgba(30, 159, 104, 0.8) 50%),
  radial-gradient(ellipse 500px 400px at 70% 30%, rgba(36, 196, 128, 0.9) 0%, rgba(30, 159, 104, 0.85) 40%, rgba(30, 159, 104, 0.8) 70%)
`,

          border: "2px solid rgba(255, 255, 255, 0.2)",
          borderRadius: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
            zIndex: 0
          }}
        />
        
        {/* Animated SVG background */}
        <Box sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: "hidden",
          "& .restricted-animation": {
            position: "absolute",
            top: { xs: "35%", md: "50%" },
            left: "50%",
            transform: { xs: "translate(-50%, -35%)", md: "translate(-50%, -50%)" },
            width: { xs: "120vw", md: "100vw" },
            height: { xs: "120vh", md: "100vh" },
            maxHeight: "100vh",
            opacity: 0.6
          }
        }}>
          <RestrictedHero />
        </Box>
        
        <Box sx={{
          maxWidth: "90%",
          mx: "auto",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
          textAlign: "center",
          px: { xs: 3, md: 6 }
        }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              fontSize: { xs: '2.288rem', md: '2.8rem' },
              mb: { xs: 1, md: 1.5 },
              lineHeight: 1.1
            }}
          >
            {t.auth.loginRequired.restrictedAccess}
          </Typography>
          <Typography
            variant="h3"
            component="span"
            sx={{
              color: '#000000',
              fontWeight: 700,
              fontSize: { xs: '1.6rem', md: '1.96rem' },
              mt: { xs: 0.5, md: 0.5 },
              mb: { xs: 1, md: 1.5 },
              display: 'block',
              lineHeight: 1.1
            }}
          >
            {t.auth.loginRequired.mustLoginToContinue}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#ffffff',
              bold: 400,
              fontSize: { xs: '1.4rem', md: '1.125rem' },
              maxWidth: '600px',
              mt: { xs: 2, md: 2 },
              mb: 0,
              lineHeight: 1.6
            }}
          >
            {t.auth.loginRequired.description}
          </Typography>
        </Box>
      </Box>

      {/* Content Section */}
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
              flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            <Button
              onClick={handleLogin}
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: "#29C480",
                color: "#1e293b",
                fontWeight: 600,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "1rem",
                transition: "background-color 0.3s ease, color 0.3s ease",
                "&:hover": {
                  backgroundColor: "#ffffff",
                  color: "#000000"
                },
                "& .MuiSvgIcon-root": {
                  transition: "transform 0.3s ease"
                },
                "&:hover .MuiSvgIcon-root": {
                  transform: "translateX(4px)"
                }
              }}
            >
                    {t.auth.login}
              <ArrowForward sx={{ fontSize: 18, ml: 0.5 }} />
                  </Button>
            <Button
              variant="outlined"
              className="border-glow-hover"
              onClick={handleBack}
              sx={{
                px: 4,
                py: 1.5,
                color: "#29C480",
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                borderColor: "#29C480",
                "&:hover": {
                  borderColor: "#29C480",
                  backgroundColor: "rgba(41, 196, 128, 0.1)"
                }
              }}
            >
                    {t.auth.loginRequired.back}
                  </Button>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default LoginRequiredPage;
