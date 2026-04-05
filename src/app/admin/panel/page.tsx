'use client';

import React from 'react';
import { Box } from '@mui/material';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import { LoadingSpinner } from '@/presentation/@shared/components/ui/atoms/loading-spinner';
import { Stack } from '@/presentation/@shared/components/ui/molecules/stack';

export default function PanelPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'}}
    >
      <Stack spacing={3} alignItems="center">
        <Text variant="h5" weight="bold" align="center">
          Redirigiendo al panel...
        </Text>
        <LoadingSpinner color="primary" size="large" />
      </Stack>
    </Box>
  );
}
