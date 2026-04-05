"use client";

import React from "react";
import MainLayout from "@/presentation/@shared/components/layouts/main-layout";
import { TermsHero } from "@/presentation/@shared/components/ui/molecules/terms-hero";
import { Box, Container, Grid } from "@mui/material";
import { Section } from "@/presentation/@shared/components/ui/molecules/details-section/detalis-sections";

interface SectionData {
title: string;
items: string[];
subText?: string;
}

interface PolicyPageTemplateProps {
heroTitle: string;
heroSubtitle: string;
heroDescription: string;
sections: SectionData[];
}

const PolicyPageTemplate: React.FC<PolicyPageTemplateProps> = ({
heroTitle,
heroSubtitle,
heroDescription,
sections,
}) => ( 
<MainLayout> 
    <TermsHero
        title={heroTitle}
        subtitle={heroSubtitle}
        description={heroDescription}
    />
        <Box component="section" sx={{ py: 8, width: "100%" }}>
            <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}> 
                <Grid container spacing={4} justifyContent="center">
                <Grid size={{ xs: 12, md: 10, lg: 8 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
{                           sections.map((section) => ( <Section
                            key={section.title}
                            title={section.title}
                            items={section.items}
                            subText={section.subText}
                        />
                        ))} 
                    </Box> 
                </Grid> 
                </Grid> 
            </Container> 
        </Box> 
    </MainLayout>
);
export default PolicyPageTemplate;
