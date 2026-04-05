import React from 'react';
import { Box, Divider } from '@mui/material';
import { ProductEntity } from '@/presentation/@shared/types/product';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import { Stack } from '@/presentation/@shared/components/ui/molecules/stack';


interface GrillProps {
  product: ProductEntity;
}

const Grill: React.FC<GrillProps> = ({ product }) => {
  const productSpecs = (product as ProductEntity & { productSpecs?: Array<{ label: string; value: string }> }).productSpecs;
  if (!productSpecs || productSpecs.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Text 
        variant="h5" 
        fontWeight="bold"
        sx={{
          fontSize: { xs: '1.125rem', md: '1.25rem' },
          color: '#ffffff'
        }}
      >
        Ficha técnica
      </Text>
      <Stack spacing={0}>
        {productSpecs.map((spec, index) => (
          <Box key={index}>
            <Box
              className="spec-row"
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingY: 1.5,
              }}
            >
              <Box 
                className="spec-box spec-label" 
                sx={{ 
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', md: '0.9375rem' },
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                {spec.label}
              </Box>
              <Box 
                className="spec-box" 
                sx={{ 
                  textAlign: 'right',
                  fontSize: { xs: '0.875rem', md: '0.9375rem' },
                  color: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                {spec.value}
              </Box>
            </Box>
            {index < productSpecs.length - 1 && <Divider />}
          </Box>
        ))}
      </Stack>
    </Stack>
  );
};

export default Grill;
