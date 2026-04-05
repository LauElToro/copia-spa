/**
 * Sumsub WebSDK Global Type Declarations
 */

import type { SumsubSDKBuilder, SumsubTokenRefreshCallback } from '@/presentation/@shared/types/sumsub';

declare global {
  interface Window {
    snsWebSdk?: {
      init: (
        accessToken: string,
        refreshTokenCallback: SumsubTokenRefreshCallback
      ) => SumsubSDKBuilder;
    };
  }
}

export {};

