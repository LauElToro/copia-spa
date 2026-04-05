/**
 * Verification Status Alert Component
 *
 * Displays verification status with appropriate styling and messaging.
 * Supports both KYC and KYB verification types.
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Icon } from '../../atoms/icon';
import {
  VerificationStatus,
  RejectionInfo,
  VerificationType,
  VERIFICATION_TRANSLATIONS} from '@/presentation/@shared/types/verification';

export interface VerificationStatusAlertProps {
  status: VerificationStatus;
  type: VerificationType;
  rejectionInfo?: RejectionInfo;
}

/**
 * Get status-specific styling
 */
const getStatusStyle = (status: VerificationStatus) => {
  switch (status) {
    case VerificationStatus.VERIFIED:
      return {
        background: '#d4edda',
        borderColor: '#c3e6cb',
        iconColor: 'text-success',
        iconName: 'bi-check-circle'};
    case VerificationStatus.REJECTED:
      return {
        background: '#f8d7da',
        borderColor: '#f5c6cb',
        iconColor: 'text-danger',
        iconName: 'bi-x-circle'};
    case VerificationStatus.REVIEW:
      return {
        background: '#fff3cd',
        borderColor: '#ffeaa7',
        iconColor: 'text-warning',
        iconName: 'bi-clock-history'};
    case VerificationStatus.PENDING:
    default:
      return {
        background: '#d1ecf1',
        borderColor: '#bee5eb',
        iconColor: 'text-info',
        iconName: 'bi-info-circle'};
  }
};

/**
 * Get status message
 */
const getStatusMessage = (status: VerificationStatus, type: VerificationType, rejectionInfo?: RejectionInfo) => {
  const verificationType = type === 'kyc' ? 'identidad' : 'negocio';

  switch (status) {
    case VerificationStatus.VERIFIED:
      return {
        heading: VERIFICATION_TRANSLATIONS.VERIFICATION_COMPLETED_MESSAGE,
        message: `Tu ${verificationType} ha sido verificad${type === 'kyc' ? 'a' : 'o'} exitosamente. Ya puedes acceder a todas las funcionalidades.`};
    case VerificationStatus.REJECTED:
      if (rejectionInfo?.canRetry) {
        return {
          heading: VERIFICATION_TRANSLATIONS.VERIFICATION_REJECTED_MESSAGE,
          message: `Tu verificación de ${verificationType} fue rechazada, pero puedes intentar nuevamente.`};
      }
      return {
        heading: VERIFICATION_TRANSLATIONS.VERIFICATION_REJECTED_MESSAGE,
        message: `Tu verificación de ${verificationType} fue rechazada de forma definitiva. Por favor, contacta con soporte.`};
    case VerificationStatus.REVIEW:
      if (rejectionInfo?.canRetry) {
        return {
          heading: 'Verificación Requiere Corrección',
          message: `Tu verificación anterior fue rechazada. Debes reintentar con documentos corregidos.`};
      }
      return {
        heading: VERIFICATION_TRANSLATIONS.VERIFICATION_IN_PROGRESS,
        message: `Tu verificación de ${verificationType} está siendo procesada. Puedes continuar el proceso o esperar la revisión.`};
    case VerificationStatus.PENDING:
    default:
      return {
        heading: VERIFICATION_TRANSLATIONS.VERIFICATION_REQUIRED,
        message: `Para acceder a todas las funcionalidades, debes verificar tu ${verificationType}. Este proceso es seguro y toma solo unos minutos.`};
  }
};

/**
 * Verification Status Alert Component
 */
export const VerificationStatusAlert: React.FC<VerificationStatusAlertProps> = ({
  status,
  type,
  rejectionInfo}) => {
  const style = getStatusStyle(status);
  const { heading, message } = getStatusMessage(status, type, rejectionInfo);

  return (
    <Box
      sx={{
        border: `1px solid ${style.borderColor}`,
        background: style.background,
        borderRadius: '16px',
        p: 3,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
      }}
    >
      <Box sx={{ flexShrink: 0, mt: 0.5 }}>
        <Icon 
          name={style.iconName} 
          color={style.iconColor === 'text-success' ? '#34d399' : style.iconColor === 'text-danger' ? '#ef4444' : style.iconColor === 'text-warning' ? '#fbbf24' : '#60a5fa'} 
          size="lg" 
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="h5"
          sx={{
            fontSize: { xs: '1rem', md: '1.125rem' },
            fontWeight: 700,
            color: '#1e293b',
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            mb: 1.5,
          }}
        >
          {heading}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: '#1e293b',
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            lineHeight: 1.6,
            mb: status === VerificationStatus.REJECTED || (status === VerificationStatus.REVIEW && rejectionInfo?.canRetry) ? 2 : 0,
          }}
        >
          {message}
        </Typography>

        {/* Display rejection reasons if available */}
        {status === VerificationStatus.REJECTED && rejectionInfo?.rejectLabels && rejectionInfo.rejectLabels.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#1e293b',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                mb: 1,
              }}
            >
              Motivos:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 3, listStyle: 'disc' }}>
              {rejectionInfo.rejectLabels.map((label) => (
                <Box component="li" key={label} sx={{ mb: 0.5 }}>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      color: '#1e293b',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    {VERIFICATION_TRANSLATIONS[label as keyof typeof VERIFICATION_TRANSLATIONS] || label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Display rejection reasons for review status with retry */}
        {status === VerificationStatus.REVIEW && rejectionInfo?.canRetry && rejectionInfo?.rejectLabels && rejectionInfo.rejectLabels.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#1e293b',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                mb: 1,
              }}
            >
              Motivos del rechazo anterior:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 3, listStyle: 'disc', mb: 1.5 }}>
              {rejectionInfo.rejectLabels.map((label) => (
                <Box component="li" key={label} sx={{ mb: 0.5 }}>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      color: '#1e293b',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    {VERIFICATION_TRANSLATIONS[label as keyof typeof VERIFICATION_TRANSLATIONS] || label}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Typography
              sx={{
                fontSize: '0.875rem',
                color: '#1e293b',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                fontWeight: 600,
              }}
            >
              <Box component="span" sx={{ fontWeight: 700 }}>Importante:</Box> Asegúrate de corregir estos problemas antes de reintentar.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

