"use client";

import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import TutorialCard from "./components/video";
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import { Grid, Container } from '@mui/material';

const TutorialPage: React.FC = () => {
  const { t } = useLanguage();
  
  const tutorials = useMemo(() => [
    { title: t.tutorials.howToUploadProducts, videoUrl: "https://www.youtube.com/embed/3NQqWwqfQgY" },
    { title: t.tutorials.whichPlanToChoose, videoUrl: "https://www.youtube.com/embed/F0Z0RenhjsE" },
    /* { title: t.tutorials.configureAI, videoUrl: "https://www.youtube.com/embed/NUOJUU-qQCY" }, */
    { title: t.tutorials.howToUploadWallets, videoUrl: "https://www.youtube.com/embed/GPBQESIVniU" },
    { title: t.tutorials.howToBuyWithCrypto, videoUrl: "https://www.youtube.com/embed/VMN09CVrcfU" },
    { title: t.tutorials.howToCreateStore, videoUrl: "https://www.youtube.com/embed/fu34Zu0Og9g" },
    { title: t.tutorials.howToMakeTransfers, videoUrl: "https://www.youtube.com/embed/T0QMWmQonhg" },
    { title: t.tutorials.decentralizeShipping, videoUrl: "https://www.youtube.com/embed/xYAveowYjN8" },
  ], [t]);

  return (
    <MainLayout>
      <Container>
        <Box sx={{ marginTop: 5, padding: 3, marginBottom: 3 }}>
          <Text variant="h1" fontWeight="bold">
            {t.tutorials.title}
          </Text>
        </Box>

        <Grid container spacing={3}>
          {tutorials.map((tut) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tut.videoUrl}>
              <TutorialCard title={tut.title} videoUrl={tut.videoUrl} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </MainLayout>
  );
};

export default TutorialPage; 
