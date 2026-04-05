"use client";

import React from 'react';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { TermsHero } from '@/presentation/@shared/components/ui/molecules/terms-hero';
import { Box, Container, Grid } from '@mui/material';
import { Section } from '@/presentation/@shared/components/ui/molecules/details-section/detalis-sections';

const VerificationSystemPage: React.FC = () => {
  const verificationSections = [
    {
      title: "Sistema de Verificación en Liberty Club",
      items: [
        "En Liberty Club priorizamos la seguridad y la confianza en cada transacción dentro de nuestro marketplace.",
        "Implementamos un sistema de verificación para las tiendas que venden en la plataforma, a través de nuestro socio tecnológico Sumsub, empresa líder en soluciones de verificación de identidad (KYC/KYB)."
      ]
    },
    {
      title: "¿Qué significan KYC y KYB?",
      items: [
        "KYC (Know Your Customer): es el proceso de verificación de identidad de una persona.",
        "KYB (Know Your Business): es el proceso de verificación de una empresa o tienda.",
        "En Liberty Club, este sistema aplica únicamente a las tiendas vendedoras.",
        "Los usuarios compradores no están obligados a verificarse, aunque quienes lo hacen mediante KYC aparecerán en la plataforma con la insignia de 'Persona verificada'.",
        "Para las tiendas, el proceso de KYB es obligatorio para aparecer como 'Tienda verificada'.",
        "En caso de no completar este proceso, la tienda se mostrará como 'No verificada'."
      ]
    },
    {
      title: "Documentación solicitada",
      items: [
        "Para KYC (usuarios y representantes de tiendas): Documento de identidad oficial vigente (DNI, pasaporte o licencia de conducir) y prueba biométrica (selfie en tiempo real).",
        "Para KYB (tiendas y empresas vendedoras): Documento de constitución de la empresa o alta como persona jurídica, comprobante de domicilio fiscal de la empresa, información sobre el representante legal (incluyendo su KYC aprobado), extracto bancario o documento que acredite la titularidad de la cuenta asociada.",
        "En algunos casos, documentación adicional como estatutos sociales o registro de accionistas."
      ]
    },
    {
      title: "Beneficios de la Verificación",
      items: [
        "Para compradores: Comprar en tiendas verificadas garantiza mayor seguridad, ya que Liberty Club confirma la identidad y legitimidad del vendedor.",
        "Para tiendas: Contar con la insignia de 'Tienda verificada' aumenta la credibilidad, fomenta la confianza de los usuarios y facilita mayores oportunidades de venta.",
        "En Liberty Club recomendamos siempre elegir vendedores con verificación completa, ya que este sistema ha sido diseñado para proteger a ambas partes y generar un ecosistema más transparente y confiable."
      ]
    }
  ];

  return (
    <MainLayout>
      <TermsHero
        title="Sistema de Verificación en Liberty Club"
        subtitle="Última actualización: 21/07/2025"
        description="Verificamos tiendas y usuarios mediante KYC/KYB para garantizar identidades legítimas y un marketplace confiable."
      />
      <Box component="section" sx={{ py: 8, width: "100%" }}>
        <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
          <Grid container spacing={4} justifyContent="center">
             <Grid size={{ xs: 12, md: 10, lg: 8 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {verificationSections.map((section) => (
                            <Section
                              key={section.title}
                              title={section.title}
                              items={section.items}
                            />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default VerificationSystemPage;

