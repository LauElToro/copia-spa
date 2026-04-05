'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

interface StoreProgressIndicatorProps {
  currentStoreIndex: number;
  totalStores: number;
  storeName: string;
  currentStep?: number;
  totalSteps?: number;
}

const STEP_LABELS = ['Envío', 'Pago', 'Red', 'Confirmar'];

export const StoreProgressIndicator: React.FC<StoreProgressIndicatorProps> = ({
  currentStoreIndex,
  totalStores,
  storeName,
  currentStep = 1,
  totalSteps = 4,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      {/* Header con nombre de tienda y progreso */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: { xs: 1, md: 2 },
          mb: 3,
        }}
      >
        <Typography
          sx={{
            color: '#29C480',
            fontSize: { xs: '1.1rem', md: '1.25rem' },
            fontWeight: 700,
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {storeName}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: { xs: '0.85rem', md: '0.9rem' },
            fontWeight: 600,
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          Tienda {currentStoreIndex + 1} de {totalStores}
        </Typography>
      </Box>

      {/* Barra de progreso */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: { xs: 0.5, md: 1 },
        }}
      >
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          // const isPending = index > currentStep; // Reservado para uso futuro

          return (
            <React.Fragment key={index}>
              {/* Step indicator */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: { xs: 1, md: 'none' },
                  minWidth: { md: 60 },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 28, md: 36 },
                    height: { xs: 28, md: 36 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCompleted
                      ? 'linear-gradient(135deg, #29C480 0%, #22c55e 100%)'
                      : isCurrent
                      ? 'rgba(41, 196, 128, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: isCurrent
                      ? '2px solid #29C480'
                      : isCompleted
                      ? '2px solid transparent'
                      : '2px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    boxShadow: isCompleted ? '0 2px 8px rgba(41, 196, 128, 0.4)' : 'none',
                  }}
                >
                  {isCompleted ? (
                    <CheckIcon sx={{ fontSize: { xs: 14, md: 18 }, color: '#0f172a' }} />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: { xs: '0.75rem', md: '0.85rem' },
                        fontWeight: 700,
                        color: isCurrent ? '#29C480' : 'rgba(255, 255, 255, 0.4)',
                        fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      {index + 1}
                    </Typography>
                  )}
                </Box>
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: { xs: '0.65rem', md: '0.75rem' },
                    fontWeight: 500,
                    color: isCompleted || isCurrent ? '#29C480' : 'rgba(255, 255, 255, 0.4)',
                    textAlign: 'center',
                    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  {STEP_LABELS[index]}
                </Typography>
              </Box>

              {/* Connector line */}
              {index < totalSteps - 1 && (
                <Box
                  sx={{
                    flex: 1,
                    height: 2,
                    alignSelf: 'center',
                    mt: { xs: -2.5, md: -3 },
                    mx: { xs: 0.25, md: 0.5 },
                    background: isCompleted
                      ? 'linear-gradient(90deg, #29C480, #22c55e)'
                      : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 1,
                    transition: 'all 0.3s ease',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};
