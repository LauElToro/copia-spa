'use client';

import React from 'react';
import { Box } from '@mui/material';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { Section } from '@/presentation/@shared/components/ui/molecules/section';
import { Grid } from '@mui/material';
import { Stack } from '@/presentation/@shared/components/ui/molecules/stack';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import { FeatureCard } from '@/presentation/@shared/components/ui/molecules/feature-card';
import { PlanCardFeature } from '@/presentation/@shared/components/ui/molecules/plan-card-feature';
import { Container } from '@mui/material';
import Link from 'next/link';

const UsPage: React.FC = () => {
  return (
    <MainLayout>
      <Box sx={{ backgroundColor: '#000', minHeight: '100vh' }}>
        {/* Hero Section */}
        <Section variant="dark" padding={5}>
          <Container>
            <Grid container spacing={3} justifyContent="center">
              <Grid size={{ xs: 12, lg: 8 }}>
                <Stack spacing={2} alignItems="center">
                  <Text variant="h1" fontWeight="bold" color="#fff">
                    ¡Vende sin comisiones!
                  </Text>
                  <Text variant="p" color="rgba(255, 255, 255, 0.7)">
                    Obtén el 100% de tus ganancias con nosotros.
                  </Text>
                  <Text variant="p" color="rgba(255, 255, 255, 0.7)">
                    Más ventas, más ganancias, sin intermediarios. Así de simple.
                  </Text>
                  <Button variant="success" size="lg" component={Link} href="/register">
                    Crear tienda
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Container>
        </Section>

        {/* Proceso Section */}
        <Section variant="dark" padding={5}>
          <Container>
            <Stack spacing={4} alignItems="center">
              <Text variant="h2" color="#fff">
                ¡Comenzar en Liberty Club es muy sencillo!
              </Text>
              <Grid container spacing={3} justifyContent="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <FeatureCard
                    title="Elección de plan"
                    description="Selecciona el plan que mejor se adapte a tus necesidades"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FeatureCard
                    title="Configuración de tienda"
                    description="Personaliza tu tienda con tu marca y productos"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FeatureCard
                    title="Primeras ventas"
                    description="Comienza a vender y crecer tu negocio"
                  />
                </Grid>
              </Grid>
            </Stack>
          </Container>
        </Section>

        {/* Planes Section */}
        <Section variant="dark" padding={5}>
          <Container>
            <Stack spacing={4} alignItems="center">
              <Text variant="h2" color="#fff" align="center">
                Nuestros planes
              </Text>
              <Grid container spacing={3} justifyContent="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <PlanCardFeature
                    title="Plan Satoshi Seller"
                    price="Gratuito"
                    features={[
                      '✓ Pagos en Criptomonedas',
                      '✓ Productos ilimitados',
                      '✓ Soporte técnico IA',
                      '✓ Soporte técnico humano',
                      '✓ Tienda propia personalizada',
                      '✓ Agente IA 24/7',
                      '✓ Tienda recomendada',
                      '✓ Liberty ads',
                    ]}
                    ctaText="Obtener"
                    ctaHref="/register"
                    variant="outlined"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <PlanCardFeature
                    title="Plan Pro Liberter"
                    price="197 USD/MES"
                    priceSubtext="1970 USD/AÑO"
                    features={[
                      '✓ Pagos en Criptomonedas',
                      '✓ Productos ilimitados',
                      '✓ Soporte técnico IA',
                      '✓ Soporte técnico humano',
                      '✓ Tienda propia personalizada',
                      '✓ Agente IA 24/7',
                      '✓ Tienda recomendada',
                      '✓ Liberty ads',
                    ]}
                    ctaText="Obtener"
                    ctaHref="/register"
                    recommended
                    variant="contained"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <PlanCardFeature
                    title="Plan Liberter"
                    price="15 USD/MES"
                    priceSubtext="150 USD/AÑO"
                    features={[
                      '✓ Pagos en Criptomonedas',
                      '✓ Productos ilimitados',
                      '✓ Soporte técnico IA',
                      '✓ Soporte técnico humano',
                      '✓ Tienda propia personalizada',
                      '✓ Agente IA 24/7',
                      '✗ Tienda recomendada',
                      '✗ Liberty ads',
                    ]}
                    ctaText="Obtener"
                    ctaHref="/register"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Stack>
          </Container>
        </Section>

        {/* Partners Section */}
        <Section variant="dark" padding={5}>
          <Container>
            <Grid container spacing={3} justifyContent="center">
              <Grid size={{ xs: 12, lg: 8 }}>
                <Stack spacing={2} alignItems="center">
                  <Text variant="h2" color="#fff">PLAN PARTNERS</Text>
                  <Text variant="p" color="rgba(255, 255, 255, 0.7)">
                    ¿Quieres llevar tu empresa al siguiente nivel y potenciar tus ventas descentralizadas?
                  </Text>
                  <Text variant="h3" color="#29C480">1,024 USD / MES</Text>
                  <Button variant="success" size="lg" component={Link} href="/register">
                    SER PARTNER
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Container>
        </Section>

        {/* Features Section */}
        <Section variant="dark" padding={5}>
          <Container>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <FeatureCard
                  title="SOFTWARE"
                  description="Diseñamos y desarrollamos una landing page personalizada para su negocio, con estrategias específicas para incrementar la visibilidad y atraer clientes."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <FeatureCard
                  title="IA 24/7"
                  description="Integramos soporte avanzado con inteligencia artificial en sus canales comerciales, ofreciendo asistencia constante para resolver consultas y optimizar operaciones."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <FeatureCard
                  title="MARKETING"
                  description="Implementamos estrategias de marketing y ventas a través de Mail, whatsapp y redes sociales para maximizar su alcance y atraer a más clientes."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                <FeatureCard
                  title="DATA ANALYTICS"
                  description="Ofrecemos análisis detallados y recomendaciones estratégicas para maximizar su crecimiento y competitividad en el mercado."
                />
              </Grid>
            </Grid>
          </Container>
        </Section>

        {/* Benefits Section */}
        <Section variant="dark" padding={5}>
          <Container>
            <Stack spacing={4} alignItems="center">
              <Text variant="h2" color="#fff" align="center">
                Con Liberty Club tu comercio vende más
              </Text>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FeatureCard
                    title="TODO LO QUE NECESITAS"
                    description="Seguridad, velocidad y privacidad."
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FeatureCard
                    title="MAXIMIZA TUS INGRESOS"
                    description="Haz crecer tu negocio sin comisiones. Empieza a vender hoy."
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FeatureCard
                    title="DESCENTRALIZACION"
                    description="Sistema de pagos y cobro mundial. Sin intermediarios"
                  />
                </Grid>
              </Grid>
            </Stack>
          </Container>
        </Section>
      </Box>
    </MainLayout>
  );
};

export default UsPage; 