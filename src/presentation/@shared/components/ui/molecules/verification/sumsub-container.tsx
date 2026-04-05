/**
 * Sumsub Container Component
 *
 * Embeds and manages the Sumsub WebSDK for identity/business verification.
 * Handles SDK initialization, events, and lifecycle.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { Text } from '../../atoms/text';
import { useSumsubSDK } from '@/presentation/@shared/hooks/use-sumsub-sdk';
import { VerificationType } from '@/presentation/@shared/types/verification';
import { SumsubEventType } from '@/presentation/@shared/types/sumsub';

export interface SumsubContainerProps {
  accessToken: string;
  verificationType: VerificationType;
  email?: string;
  phone?: string;
  onComplete?: (status: 'approved' | 'rejected' | 'error') => void;
  onTokenRefresh?: () => Promise<string>;
}

/**
 * Sumsub Container Component
 */
export const SumsubContainer: React.FC<SumsubContainerProps> = ({
  accessToken,
  verificationType,
  email,
  phone,
  onComplete,
  onTokenRefresh}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerId] = useState(`sumsub-container-${Date.now()}`);
  const [hasLaunched, setHasLaunched] = useState(false);

  const { isLoading, error, initializeSDK } = useSumsubSDK({
    accessToken,
    config: {
      lang: 'es',
      email,
      phone,
      i18n: {
        document: {
          subTitles: {
            IDENTITY: 'Sube un documento que pruebe tu identidad',
            ...(verificationType === 'kyb' && {
              COMPANY: 'Sube documentos que prueben la información de la empresa'})}}}},
    options: {
      addViewportTag: false,
      adaptIframeHeight: true},
    onMessage: (type, payload) => {
      switch (type) {
        case SumsubEventType.ID_CHECK_APPROVED:
          onComplete?.('approved');
          break;

        case SumsubEventType.ID_CHECK_REJECTED:
          onComplete?.('rejected');
          break;

        case SumsubEventType.ID_CHECK_ERROR:
          console.error('Sumsub verification error:', payload);
          onComplete?.('error');
          break;

        case SumsubEventType.ID_CHECK_APPLICANT_VERIFICATION_COMPLETED:
          if (payload && 'reviewResult' in payload) {
            const result = (payload as { reviewResult?: { reviewAnswer?: string } }).reviewResult;
            if (result?.reviewAnswer === 'GREEN') {
              onComplete?.('approved');
            } else if (result?.reviewAnswer === 'RED') {
              onComplete?.('rejected');
            }
          }
          break;

        case SumsubEventType.ID_CHECK_APPLICANT_SUBMITTED:
        case SumsubEventType.ID_CHECK_STEP_COMPLETED:
        case SumsubEventType.ID_CHECK_REVIEW_PENDING:
        case SumsubEventType.ID_CHECK_STATUS_CHANGED:
        case SumsubEventType.ID_CHECK_STEP_INITIATED:
        case SumsubEventType.ID_CHECK_AGREEMENT_SIGNED:
        case SumsubEventType.ID_CHECK_LIVENESS_COMPLETED:
        case SumsubEventType.ID_CHECK_READY:
        case SumsubEventType.ID_CHECK_INITIALIZED:
        case SumsubEventType.ID_CHECK_APPLICANT_LOADED:
        case SumsubEventType.ID_CHECK_LANGUAGE_CHANGED:
        case SumsubEventType.ID_CHECK_APPLICANT_RESET:
        case SumsubEventType.ID_CHECK_RESIZE:
          // Eventos manejados silenciosamente
          break;

        default:
          // Ignorar eventos desconocidos en producción
          break;
      }
    },
    onError: (error) => {
      console.error('Sumsub SDK Error:', error);
    },
    refreshTokenCallback: onTokenRefresh});

  /**
   * Initialize SDK when container is ready
   */
  useEffect(() => {
    if (containerRef.current && !hasLaunched && accessToken) {
      // Set flag immediately to prevent race conditions
      setHasLaunched(true);
      // Initialize SDK
      initializeSDK(`#${containerId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, containerId]); // Removed hasLaunched and initializeSDK from deps to prevent re-initialization

  return (
    <Box
      className="mb-4"
      style={{ border: '1px solid var(--bs-border-color)' }}
    >
      <Text variant="h5" weight="bold" className="mb-4">
        {verificationType === 'kyc' ? 'Verificación de Identidad' : 'Verificación de Negocio'}
      </Text>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <Text variant="p" className="text-muted">
            Inicializando verificación...
          </Text>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Box
          style={{ border: '1px solid #f5c6cb' }}
        >
          <Text variant="p" className="text-danger mb-0">
            <strong>Error:</strong> {error}
          </Text>
        </Box>
      )}

      {/* SDK Container */}
      <div
        id={containerId}
        ref={containerRef}
        style={{
          minHeight: error ? '0' : '600px',
          display: error ? 'none' : 'block'}}
      />
    </Box>
  );
};

