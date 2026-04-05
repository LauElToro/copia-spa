"use client";

import React from "react";
import MainLayout from "@/presentation/@shared/components/layouts/main-layout";
import { Box, Container, Grid } from "@mui/material";
import { Section } from "@/presentation/@shared/components/ui/molecules/details-section/detalis-sections";
import { TermsHero } from "@/presentation/@shared/components/ui/molecules/terms-hero";

const BrandProtectionPage: React.FC = () => {
const sections = [
{
title: "¿En qué consiste?",
items: [
"Validamos y destacamos a tus distribuidores y tiendas oficiales para que los usuarios puedan encontrarlos fácil y rápido.",
"Te ayudamos a prevenir falsificaciones y el uso indebido de tu marca o patente.",
"Te damos canales directos para reportar problemas o gestionar reclamos de forma ágil y sin vueltas.",
"Te acompañamos durante el proceso y estamos siempre disponibles para resolver tus dudas.",
],
},
{
title: "¿Por qué sumarte?",
items: [
"Tu marca se destaca y los usuarios saben dónde comprar productos originales.",
"Tenés más herramientas para proteger tus derechos y crecer en el canal digital.",
"Ayudás a construir un ecosistema de comercio transparente y seguro.",
],
},
{
title: "¿Cómo participar?",
items: [
"Solo tenés que escribirnos y nuestro equipo te guía paso a paso.",
"📩 [compliance@libertyclub.io](mailto:compliance@libertyclub.io)",
"🌐 [www.libertyclub.io/proteccion-marcas](http://www.libertyclub.io/proteccion-marcas)",
],
},
{
title: "Mensaje final",
items: [
"En Liberty Club queremos acompañarte para que tu marca brille y esté siempre segura. Sumate a nuestro programa, estamos para ayudarte.",
],
},
];

return ( 
<MainLayout> 
  <TermsHero
     title="Invitación a Marcas y Patentes: Programa de Protección"
     subtitle="Última actualización: 21/07/2025"
     description="Validamos distribuidores y prevenimos falsificaciones para proteger tu marca."
   />
    <Box component="section" sx={{ py: 8, width: "100%" }}>
      <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}> 
        <Grid container spacing={4} justifyContent="center"> 
          <Grid size={{ xs: 12, md: 10, lg: 8 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {sections.map((section) => (
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

export default BrandProtectionPage;

