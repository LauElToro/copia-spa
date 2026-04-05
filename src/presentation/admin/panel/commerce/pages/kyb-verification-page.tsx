/**
 * KYB Verification Page
 *
 * Wrapper for the generic verification page component.
 * Provides KYB (Know Your Business) verification flow.
 */

'use client';

import React from 'react';
import { VerificationPageContent } from '@/presentation/@shared/components/ui/organisms/verification-page-content';

const KybVerificationPage: React.FC = () => {
  return <VerificationPageContent type="kyb" />;
};

export default KybVerificationPage;
