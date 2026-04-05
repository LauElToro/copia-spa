/**
 * KYC Verification Page
 *
 * Wrapper for the generic verification page component.
 * Provides KYC (Know Your Customer) verification flow.
 */

'use client';

import React from 'react';
import { VerificationPageContent } from '@/presentation/@shared/components/ui/organisms/verification-page-content';

const KycVerificationPage: React.FC = () => {
  return <VerificationPageContent type="kyc" />;
};

export default KycVerificationPage;

