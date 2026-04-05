/**
 * Verification Requirements Component
 *
 * Displays required documents and information for verification.
 * Supports both KYC and KYB verification types.
 */

import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Stack } from '@/presentation/@shared/components/ui/molecules/stack';
import { Icon } from '../../atoms/icon';
import { VerificationType } from '@/presentation/@shared/types/verification';

export interface VerificationRequirementsProps {
  type: VerificationType;
}

/**
 * KYC Requirements Data
 */
const KYC_REQUIREMENTS = {
  documents: [
    'Documento Nacional de Identidad (DNI)',
    'Pasaporte',
    'Licencia de conducir',
  ],
  information: [
    'Nombre completo',
    'Fecha de nacimiento',
    'Dirección de residencia',
  ]};

/**
 * KYB Requirements Data
 */
const KYB_REQUIREMENTS = {
  documents: [
    'Registro comercial',
    'Licencia de negocio',
    'Documentos de constitución',
  ],
  information: [
    'Nombre del negocio',
    'Número de registro',
    'Dirección del negocio',
  ]};

/**
 * Verification Requirements Component
 */
export const VerificationRequirements: React.FC<VerificationRequirementsProps> = ({ type }) => {
  const requirements = type === 'kyc' ? KYC_REQUIREMENTS : KYB_REQUIREMENTS;
  const title = '¿Qué necesitas para la verificación?';
  const documentsLabel = type === 'kyc' ? 'Documentos de Identidad:' : 'Documentos del Negocio:';

  return (
    <>
      <Typography
        variant="h3"
        sx={{
          fontSize: { xs: '1.25rem', md: '1.5rem' },
          fontWeight: 700,
          color: '#34d399',
          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          mb: 3,
        }}
      >
        {title}
      </Typography>

      <Grid container spacing={4}>
        {/* Documents Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            component="label"
            sx={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#ffffff',
              mb: 2,
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            {documentsLabel}
          </Typography>
          <Stack spacing={1.5}>
            {requirements.documents.map((doc) => (
              <Box key={doc} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  component="span"
                  sx={{
                    color: '#34d399',
                    fontSize: '1.125rem',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                  }}
                >
                  {doc}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Grid>

        {/* Information Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            component="label"
            sx={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#ffffff',
              mb: 2,
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            Información Requerida:
          </Typography>
          <Stack spacing={1.5}>
            {requirements.information.map((info) => (
              <Box key={info} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  component="span"
                  sx={{
                    color: '#34d399',
                    fontSize: '1.125rem',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                  }}
                >
                  {info}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>

      {/* Note */}
      <Box sx={{ mt: 4, pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ mt: 0.25, flexShrink: 0 }}>
            <Icon name="bi-info-circle" color="#34d399" size="md" />
          </Box>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            <Box component="span" sx={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>Nota:</Box> Este proceso es completamente seguro y tus datos están protegidos. La verificación toma entre 5-10 minutos.
          </Typography>
        </Box>
      </Box>
    </>
  );
};

