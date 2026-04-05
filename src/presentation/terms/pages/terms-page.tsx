"use client";

import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { TermsHero } from '@/presentation/@shared/components/ui/molecules/terms-hero';

const TermsPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <MainLayout>
      {/* Hero Section */}
      <TermsHero />

      {/* Terms Content Section */}
      <Box
        component="section"
        sx={{
          py: 8,
          width: "100%"
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
          <Grid 
            container 
            spacing={4}
            justifyContent="center"
          >
            {/* Columna del Contenido */}
            <Grid 
              size={{ xs: 12, md: 10, lg: 8 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3
                }}
              >
                {/* Welcome Card */}
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                  }}
                >
                  <div 
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }} 
                    dangerouslySetInnerHTML={{ __html: t.terms.welcome }} 
                  />
                </Box>

                {/* Definitions Section */}
                <Box
                  component="section"
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.terms.definitions}
                  </Typography>
                  <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {[
                      t.terms.definitionsList.user,
                      t.terms.definitionsList.seller,
                      t.terms.definitionsList.buyer,
                      t.terms.definitionsList.transaction,
                      t.terms.definitionsList.blockchain
                    ].map((item, index) => (
                      <Box
                        component="li"
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          mb: 1.5,
                          "&:last-child": { mb: 0 },
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            color: "#34d399",
                            fontSize: "1.125rem",
                            mr: 1,
                            mt: 0.25,
                            flexShrink: 0,
                            lineHeight: 1,
                          }}
                        >
                          ✓
                        </Box>
                        <Typography
                          sx={{
                            fontSize: { xs: "0.8125rem", md: "0.875rem" },
                            lineHeight: 1.6,
                            color: "#ffffff",
                            opacity: 0.9,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          }}
                        >
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Use of Platform Section */}
                <Box
                  component="section"
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.terms.useOfPlatform}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      t.terms.useOfPlatform21,
                      t.terms.useOfPlatform22,
                      t.terms.useOfPlatform23,
                      t.terms.useOfPlatform24,
                      t.terms.useOfPlatform25
                    ].map((item, index) => (
                      <Typography
                        key={index}
                        sx={{
                          fontSize: { xs: "0.8125rem", md: "0.875rem" },
                          lineHeight: 1.6,
                          color: "#ffffff",
                          opacity: 0.9,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Purchase and Sale Conditions Section */}
                <Box
                  component="section"
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.terms.purchaseSaleConditions}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      t.terms.purchaseSale31,
                      t.terms.purchaseSale32,
                      t.terms.purchaseSale33,
                      t.terms.purchaseSale34
                    ].map((item, index) => (
                      <Typography
                        key={index}
                        sx={{
                          fontSize: { xs: "0.8125rem", md: "0.875rem" },
                          lineHeight: 1.6,
                          color: "#ffffff",
                          opacity: 0.9,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Payments and Transactions Section */}
                <Box
                  component="section"
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.terms.paymentsTransactions}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      t.terms.payments41,
                      t.terms.payments42,
                      t.terms.payments43,
                      t.terms.payments44
                    ].map((item, index) => (
                      <Typography
                        key={index}
                        sx={{
                          fontSize: { xs: "0.8125rem", md: "0.875rem" },
                          lineHeight: 1.6,
                          color: "#ffffff",
                          opacity: 0.9,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Liability Section */}
                <Box
                  component="section"
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.terms.liability}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      t.terms.liability51,
                      t.terms.liability52,
                      t.terms.liability53
                    ].map((item, index) => (
                      <Typography
                        key={index}
                        sx={{
                          fontSize: { xs: "0.8125rem", md: "0.875rem" },
                          lineHeight: 1.6,
                          color: "#ffffff",
                          opacity: 0.9,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Sanctions Section */}
                <Box
                  component="section"
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.terms.sanctions}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8125rem", md: "0.875rem" },
                        lineHeight: 1.6,
                        color: "#ffffff",
                        opacity: 0.9,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                      {t.terms.sanctions61}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8125rem", md: "0.875rem" },
                        lineHeight: 1.6,
                        color: "#ffffff",
                        opacity: 0.9,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                      {t.terms.sanctions62}
                    </Typography>
                    <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {[
                        t.terms.sanctionsProhibited1,
                        t.terms.sanctionsProhibited2,
                        t.terms.sanctionsProhibited3,
                        t.terms.sanctionsProhibited4,
                        t.terms.sanctionsProhibited5
                      ].map((item, index) => (
                        <Box
                          component="li"
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            mb: 1.5,
                            "&:last-child": { mb: 0 },
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              color: "#34d399",
                              fontSize: "1.125rem",
                              mr: 1,
                              mt: 0.25,
                              flexShrink: 0,
                              lineHeight: 1,
                            }}
                          >
                            ✓
                          </Box>
                          <Typography
                            sx={{
                              fontSize: { xs: "0.8125rem", md: "0.875rem" },
                              lineHeight: 1.6,
                              color: "#ffffff",
                              opacity: 0.9,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}
                          >
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8125rem", md: "0.875rem" },
                        lineHeight: 1.6,
                        color: "#ffffff",
                        opacity: 0.9,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        mt: 1
                      }}
                    >
                      {t.terms.sanctions63}
                    </Typography>
                  </Box>
                </Box>

                {/* Intellectual Property Section */}
                <Box
                  component="section"
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.terms.intellectualProperty}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      t.terms.intellectual71,
                      t.terms.intellectual72,
                      t.terms.intellectual73
                    ].map((item, index) => (
                      <Typography
                        key={index}
                        sx={{
                          fontSize: { xs: "0.8125rem", md: "0.875rem" },
                          lineHeight: 1.6,
                          color: "#ffffff",
                          opacity: 0.9,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Fees and Payments Section */}
                <Box
                  component="section"
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.terms.feesPayments}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      t.terms.fees81,
                      t.terms.fees82
                    ].map((item, index) => (
                      <Typography
                        key={index}
                        sx={{
                          fontSize: { xs: "0.8125rem", md: "0.875rem" },
                          lineHeight: 1.6,
                          color: "#ffffff",
                          opacity: 0.9,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Billing Section */}
                <Box
                  component="section"
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.terms.billing}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      t.terms.billing91,
                      t.terms.billing92
                    ].map((item, index) => (
                      <Typography
                        key={index}
                        sx={{
                          fontSize: { xs: "0.8125rem", md: "0.875rem" },
                          lineHeight: 1.6,
                          color: "#ffffff",
                          opacity: 0.9,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Applicable Law Section */}
                <Box
                  component="section"
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.terms.applicableLaw}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      t.terms.law101,
                      t.terms.law102
                    ].map((item, index) => (
                      <Typography
                        key={index}
                        sx={{
                          fontSize: { xs: "0.8125rem", md: "0.875rem" },
                          lineHeight: 1.6,
                          color: "#ffffff",
                          opacity: 0.9,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Modifications Section */}
                <Box
                  component="section"
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.terms.modifications}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      t.terms.modifications111,
                      t.terms.modifications112
                    ].map((item, index) => (
                      <Typography
                        key={index}
                        sx={{
                          fontSize: { xs: "0.8125rem", md: "0.875rem" },
                          lineHeight: 1.6,
                          color: "#ffffff",
                          opacity: 0.9,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Digital Communications Section */}
                <Box
                  component="section"
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.terms.digitalCommunications}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      t.terms.digital121,
                      t.terms.digital122
                    ].map((item, index) => (
                      <Typography
                        key={index}
                        sx={{
                          fontSize: { xs: "0.8125rem", md: "0.875rem" },
                          lineHeight: 1.6,
                          color: "#ffffff",
                          opacity: 0.9,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Acceptance Section */}
                <Box
                  component="section"
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                    border: "2px solid rgba(41, 196, 128, 0.1)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default",
                    "&:hover": {
                      backgroundColor: "rgba(41, 196, 128, 0.08)",
                      borderColor: "rgba(41, 196, 128, 0.4)",
                    },
                    padding: { xs: 3, md: 4 },
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.terms.acceptance}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box
                      sx={{
                        fontSize: { xs: "0.8125rem", md: "0.875rem" },
                        lineHeight: 1.6,
                        color: "#ffffff",
                        opacity: 0.9,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                      dangerouslySetInnerHTML={{ __html: t.terms.acceptanceText }} 
                    />
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8125rem", md: "0.875rem" },
                        lineHeight: 1.6,
                        color: "#ffffff",
                        opacity: 0.9,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                      {t.terms.contactSupport}
                    </Typography>
                    <Box
                      sx={{
                        fontSize: { xs: "0.8125rem", md: "0.875rem" },
                        lineHeight: 1.6,
                        color: "#ffffff",
                        opacity: 0.9,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                      dangerouslySetInnerHTML={{ __html: `<strong>${t.terms.footer}</strong>` }} 
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default TermsPage;
