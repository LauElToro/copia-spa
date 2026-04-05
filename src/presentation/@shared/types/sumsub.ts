/**
 * Sumsub WebSDK Types
 *
 * Type definitions for Sumsub WebSDK integration.
 * Based on Sumsub documentation and SDK API.
 */

/**
 * Sumsub SDK Configuration
 */
export interface SumsubConfig {
  lang?: string;
  email?: string;
  phone?: string;
  i18n?: {
    document?: {
      subTitles?: {
        IDENTITY?: string;
        COMPANY?: string;
        [key: string]: string | undefined;
      };
    };
    [key: string]: unknown;
  };
  uiConf?: {
    customCssStr?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Sumsub SDK Options
 */
export interface SumsubOptions {
  addViewportTag?: boolean;
  adaptIframeHeight?: boolean;
  [key: string]: unknown;
}

/**
 * Sumsub Event Types
 */
export enum SumsubEventType {
  // Verification result events
  ID_CHECK_APPROVED = 'idCheck.onApproved',
  ID_CHECK_REJECTED = 'idCheck.onRejected',
  ID_CHECK_ERROR = 'idCheck.onError',
  ID_CHECK_STEP_COMPLETED = 'idCheck.onStepCompleted',
  ID_CHECK_REVIEW_PENDING = 'idCheck.onReviewPending',

  // Applicant events
  ID_CHECK_APPLICANT_LOADED = 'idCheck.onApplicantLoaded',
  ID_CHECK_APPLICANT_RESET = 'idCheck.applicantReset',
  ID_CHECK_APPLICANT_SUBMITTED = 'idCheck.onApplicantSubmitted',
  ID_CHECK_APPLICANT_VERIFICATION_COMPLETED = 'idCheck.onApplicantVerificationCompleted',

  // Step events
  ID_CHECK_STEP_INITIATED = 'idCheck.onStepInitiated',

  // Agreement events
  ID_CHECK_AGREEMENT_SIGNED = 'idCheck.onAgreementSigned',

  // Liveness events
  ID_CHECK_LIVENESS_COMPLETED = 'idCheck.onLivenessCompleted',

  // SDK lifecycle events
  ID_CHECK_READY = 'idCheck.onReady',
  ID_CHECK_INITIALIZED = 'idCheck.onInitialized',
  ID_CHECK_LANGUAGE_CHANGED = 'idCheck.onLanguageChanged',
  ID_CHECK_RESIZE = 'idCheck.onResize',

  // Status change events
  ID_CHECK_STATUS_CHANGED = 'idCheck.onApplicantStatusChanged',
}

/**
 * Sumsub Event Payload
 */
export interface SumsubEventPayload {
  applicantId?: string;
  reviewStatus?: string;
  reviewResult?: {
    reviewAnswer?: string;
    rejectLabels?: string[];
    clientComment?: string;
    moderationComment?: string;
  };
  [key: string]: unknown;
}

/**
 * Sumsub Message Handler
 */
export type SumsubMessageHandler = (type: string, payload?: SumsubEventPayload) => void;

/**
 * Sumsub Error Handler
 */
export type SumsubErrorHandler = (error: Error | string) => void;

/**
 * Sumsub Token Refresh Callback
 */
export type SumsubTokenRefreshCallback = () => Promise<string>;

/**
 * Sumsub SDK Builder Interface
 */
export interface SumsubSDKBuilder {
  withConf(config: SumsubConfig): SumsubSDKBuilder;
  withOptions(options: SumsubOptions): SumsubSDKBuilder;
  on(event: string, handler: SumsubErrorHandler): SumsubSDKBuilder;
  onMessage(handler: SumsubMessageHandler): SumsubSDKBuilder;
  build(): SumsubSDKInstance;
}

/**
 * Sumsub SDK Instance Interface
 */
export interface SumsubSDKInstance {
  launch(containerId: string): void;
  reset(): void;
  destroy(): void;
  goToStep(stepName: string): void;
}

/**
 * Sumsub Access Token Response
 */
export interface SumsubAccessTokenResponse {
  success: boolean;
  accessToken: string;
  applicantId: string;
  verificationType?: string;
}

/**
 * Sumsub SDK Initialization Parameters
 */
export interface SumsubInitParams {
  accessToken: string;
  refreshTokenCallback: SumsubTokenRefreshCallback;
  config?: SumsubConfig;
  options?: SumsubOptions;
  onMessage?: SumsubMessageHandler;
  onError?: SumsubErrorHandler;
}

/**
 * Sumsub SDK State
 */
export interface SumsubSDKState {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  instance: SumsubSDKInstance | null;
}

/**
 * Global Window Interface Extension for Sumsub
 */
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

