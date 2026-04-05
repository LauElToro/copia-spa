import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon, CheckCircle, Lightbulb } from '@mui/icons-material';
import { Stack } from '../../molecules/stack';
import { Text } from '../text';

export interface InfoBannerProps {
  title: string;
  description: string;
  items: Array<{ text: string }>;
  tip?: string;
  onClose?: () => void;
  show?: boolean;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({
  title,
  description,
  items,
  tip,
  onClose,
  show = true,
}) => {
  if (!show) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        mb: 3,
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
        backgroundColor: "rgba(41, 196, 128, 0.08)",
        border: "2px solid rgba(41, 196, 128, 0.2)",
        borderRadius: "24px",
        padding: { xs: 3, md: 4 },
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          backgroundColor: "rgba(41, 196, 128, 0.12)",
          borderColor: "rgba(41, 196, 128, 0.4)",
        },
      }}
    >
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              color: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      )}
      
      <Stack spacing={2}>
        <Typography
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 700,
            color: '#34d399',
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            pr: onClose ? 5 : 0,
          }}
        >
          {title}
        </Typography>
        
        <Typography
          sx={{
            fontSize: { xs: '0.875rem', md: '1rem' },
            color: '#ffffff',
            lineHeight: 1.6,
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            mb: 2,
          }}
        >
          {description}
        </Typography>
        
        <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((item, index) => (
            <Box
              key={index}
              component="li"
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mb: 1.5,
              }}
            >
              <CheckCircle
                sx={{
                  color: "#34d399",
                  fontSize: "1.125rem",
                  mr: 1.5,
                  mt: 0.25,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: { xs: "0.8125rem", md: "0.875rem" },
                  lineHeight: 1.6,
                  color: "#ffffff",
                  opacity: 0.9,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {tip && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              mt: 2,
              pt: 2,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Lightbulb
              sx={{
                color: "#34d399",
                fontSize: "1.125rem",
                mr: 1.5,
                mt: 0.25,
                flexShrink: 0,
              }}
            />
            <Text
              variant="span"
              weight="light"
              sx={{
                fontSize: { xs: "0.8125rem", md: "0.875rem" },
                lineHeight: 1.6,
                color: "#ffffff",
                opacity: 0.9,
              }}
            >
              {tip}
            </Text>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

