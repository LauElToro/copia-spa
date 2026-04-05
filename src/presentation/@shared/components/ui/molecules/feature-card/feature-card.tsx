import React, { ReactNode } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  variant?: 'default' | 'dark';
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  variant = 'dark',
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        backgroundColor: variant === 'dark' ? '#1a1a1a' : 'transparent',
        borderRadius: 2,
        padding: 2,
      }}
    >
      <CardContent>
        {icon && (
          <Box sx={{ marginBottom: 2, display: 'flex', justifyContent: 'center' }}>
            {icon}
          </Box>
        )}
        <Typography variant="h6" sx={{ color: '#fff', marginBottom: 2, fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

