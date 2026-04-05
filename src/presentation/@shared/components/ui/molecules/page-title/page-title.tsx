'use client';

import React from 'react';
import { Box } from '@mui/material';
import { Text } from '@/presentation/@shared/components/ui/atoms/text/text';
import { AnimatedSection } from '../../atoms/animated-section/animated-section';
import { Container } from '@mui/material';
import useDevice from '@/presentation/@shared/hooks/use-device';

interface PageTitleProps {
  title: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  const { isDesktop } = useDevice();

  return (
    <AnimatedSection delay={3} direction="right">
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#0D0F12',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          paddingY: 5,
          marginTop: 2}}
      >
        <Container>
          <Text
            variant='h4'
            align={isDesktop ? 'left' : 'center'}
          >
            {title}
          </Text>
        </Container>
      </Box>
    </AnimatedSection>
  );
};

export default PageTitle;