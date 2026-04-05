import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import Link from 'next/link';

export interface PlanCardFeatureProps {
  title: string;
  price: string;
  priceSubtext?: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  recommended?: boolean;
  variant?: 'outlined' | 'contained';
}

export const PlanCardFeature: React.FC<PlanCardFeatureProps> = ({
  title,
  price,
  priceSubtext,
  features,
  ctaText,
  ctaHref,
  recommended = false,
  variant = 'outlined',
}) => {
  return (
    <Card
      variant={variant === 'outlined' ? 'outlined' : 'elevation'}
      sx={{
        height: '100%',
        backgroundColor: '#1a1a1a',
        borderRadius: 2,
        padding: 2,
        position: 'relative',
        border: variant === 'outlined' ? '1px solid #29C480' : 'none',
      }}
    >
      {recommended && (
        <Chip
          label="Recomendada"
          color="success"
          sx={{
            position: 'absolute',
            top: -10,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      )}
      <CardContent>
        <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
          <Typography variant="h6" sx={{ color: '#fff', marginBottom: 1 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ color: '#29C480', fontWeight: 'bold', marginBottom: 0.5 }}>
            {price}
          </Typography>
          {priceSubtext && (
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {priceSubtext}
            </Typography>
          )}
        </Box>
        <Box component="ul" sx={{ listStyle: 'none', padding: 0, marginBottom: 3 }}>
          {features.map((feature, index) => (
            <Box
              component="li"
              key={index}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: 1,
                paddingLeft: 0,
              }}
            >
              {feature}
            </Box>
          ))}
        </Box>
        <Box sx={{ textAlign: 'center', marginTop: 3 }}>
          <Button
            variant={variant === 'outlined' ? 'secondary' : 'primary'}
            component={Link}
            href={ctaHref}
            fullWidth
          >
            {ctaText}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

