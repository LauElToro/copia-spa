/**
 * useSumsubSDK Hook
 *
 * Custom hook for managing Sumsub WebSDK initialization and lifecycle.
 * Handles script loading, SDK configuration, and event handling.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SumsubSDKInstance,
  SumsubSDKBuilder,
  SumsubConfig,
  SumsubOptions,
  SumsubMessageHandler,
  SumsubErrorHandler,
  SumsubTokenRefreshCallback,
} from '../types/sumsub';

const SUMSUB_SDK_URL = 'https://static.sumsub.com/idensic/static/sns-websdk-builder.js';
const SUMSUB_SDK_ID = 'sumsub-websdk-script';

interface UseSumsubSDKProps {
  accessToken?: string;
  config?: SumsubConfig;
  options?: SumsubOptions;
  onMessage?: SumsubMessageHandler;
  onError?: SumsubErrorHandler;
  refreshTokenCallback?: SumsubTokenRefreshCallback;
}

interface UseSumsubSDKReturn {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  instance: SumsubSDKInstance | null;
  initializeSDK: (containerId: string) => void;
  destroySDK: () => void;
}

/**
 * Hook for managing Sumsub WebSDK
 */
export const useSumsubSDK = ({
  accessToken,
  config,
  options,
  onMessage,
  onError,
  refreshTokenCallback,
}: UseSumsubSDKProps): UseSumsubSDKReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<SumsubSDKInstance | null>(null);
  const sdkLoadedRef = useRef(false);
  const initializingRef = useRef(false); // Prevent multiple simultaneous initializations

  /**
   * Wait for SDK to be available on globalThis.window
   */
  const waitForSDK = useCallback((maxAttempts = 10, interval = 200): Promise<void> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const checkSDK = () => {
        if (globalThis.window?.snsWebSdk) {
          resolve();
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error('Sumsub SDK not available on window object after maximum attempts'));
          return;
        }

        setTimeout(checkSDK, interval);
      };

      checkSDK();
    });
  }, []);

  /**
   * Load Sumsub SDK script dynamically
   */
  const loadSDKScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.getElementById(SUMSUB_SDK_ID)) {
        sdkLoadedRef.current = true;
        // Wait for SDK to be available even if script exists
        waitForSDK().then(resolve).catch(reject);
        return;
      }

      // Check if SDK is already available on window
      if (globalThis.window?.snsWebSdk) {
        sdkLoadedRef.current = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = SUMSUB_SDK_ID;
      script.src = SUMSUB_SDK_URL;
      script.async = true;

      script.onload = () => {
        sdkLoadedRef.current = true;
        // Wait a bit for SDK to initialize on window
        waitForSDK().then(resolve).catch(reject);
      };

      script.onerror = () => {
        reject(new Error('Failed to load Sumsub SDK script'));
      };

      document.head.appendChild(script);
    });
  }, [waitForSDK]);

  /**
   * Configure SDK builder with options and events
   */
  const configureSDKBuilder = useCallback((builder: SumsubSDKBuilder) => {
    if (config) {
      builder.withConf(config);
    }

    if (options) {
      builder.withOptions(options);
    }

    builder.on('idCheck.onError', (error) => {
      console.error('Sumsub SDK Error:', error);
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error';
      setError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    });

    if (onMessage) {
      builder.onMessage((type, payload) => onMessage(type, payload));
    }

    return builder;
  }, [config, options, onMessage, onError]);

  /**
   * Initialize Sumsub SDK and launch it in a container
   */
  const initializeSDK = useCallback(
    async (containerId: string) => {
      if (initializingRef.current || !accessToken) {
        if (!accessToken) {
          setError('Access token is required to initialize SDK');
        }
        return;
      }

      try {
        initializingRef.current = true;
        setIsLoading(true);
        setError(null);

        // Ensure SDK is loaded
        if (!sdkLoadedRef.current) {
          await loadSDKScript();
        } else if (!globalThis.window?.snsWebSdk) {
          await waitForSDK();
        }

        if (!globalThis.window?.snsWebSdk) {
          throw new Error('Sumsub SDK not available on window');
        }

        // Initialize and configure builder
        const defaultRefreshCallback: SumsubTokenRefreshCallback = async () => accessToken;
        const builder = globalThis.window.snsWebSdk.init(
          accessToken,
          refreshTokenCallback || defaultRefreshCallback
        );

        const configuredBuilder = configureSDKBuilder(builder);
        const sdkInstance = configuredBuilder.build();
        sdkInstance.launch(containerId);

        setInstance(sdkInstance);
        setIsInitialized(true);
        setIsLoading(false);
        initializingRef.current = false;
      } catch (err) {
        console.error('❌ Error initializing Sumsub SDK:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Sumsub SDK';
        setError(errorMessage);
        setIsLoading(false);
        initializingRef.current = false;
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    },
    [accessToken, refreshTokenCallback, loadSDKScript, waitForSDK, configureSDKBuilder, onError]
  );

  /**
   * Destroy SDK instance
   */
  const destroySDK = useCallback(() => {
    if (instance) {
      try {
        instance.destroy();
      } catch (err) {
        console.error('Error destroying Sumsub SDK:', err);
      }
      setInstance(null);
      setIsInitialized(false);
    }
  }, [instance]);

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      if (instance) {
        try {
          instance.destroy();
        } catch (err) {
          console.error('Error destroying Sumsub SDK on unmount:', err);
        }
      }
    };
  }, [instance]);

  return {
    isLoading,
    isInitialized,
    error,
    instance,
    initializeSDK,
    destroySDK,
  };
};

