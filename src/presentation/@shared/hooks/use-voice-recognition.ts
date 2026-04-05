"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceRecognitionProps {
  wakeWord?: string;
  onWakeWordDetected?: () => void;
  onTranscriptComplete?: (transcript: string) => void;
  onListening?: (isListening: boolean) => void;
  enabled: boolean;
  requireWakeWord?: boolean; // If false, transcribes everything without wake word
}

export const useVoiceRecognition = ({
  wakeWord = 'hey libia',
  onWakeWordDetected,
  onTranscriptComplete,
  onListening,
  enabled,
  requireWakeWord = true,
}: UseVoiceRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const wakeWordDetectedRef = useRef(false);
  const isInitializedRef = useRef(false);
  const requireWakeWordRef = useRef(requireWakeWord);
  const enabledRef = useRef(enabled);

  // Update refs when props change
  useEffect(() => {
    requireWakeWordRef.current = requireWakeWord;
    enabledRef.current = enabled;
  }, [requireWakeWord, enabled]);

  // Check if browser supports Speech Recognition
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Check existing microphone permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      if (typeof navigator !== 'undefined' && navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setHasPermission(result.state === 'granted');

          // Listen for permission changes
          result.onchange = () => {
            setHasPermission(result.state === 'granted');
          };
        } catch {
          console.log('Permission API not available');
        }
      }
    };

    checkPermission();
  }, []);

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    try {
      console.log('🎤 Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone permission granted');
      setHasPermission(true);
      // Keep stream open briefly so browser registers the permission
      await new Promise(resolve => setTimeout(resolve, 300));
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      setHasPermission(false);
      return false;
    }
  }, []);

  // Initialize Speech Recognition ONCE
  useEffect(() => {
    if (!isSupported || isInitializedRef.current) return;

    const SpeechRecognition = (window as unknown as { SpeechRecognition: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      onListening?.(true);
      finalTranscriptRef.current = '';
      wakeWordDetectedRef.current = false;
    };

    recognition.onend = () => {
      setIsListening(false);
      onListening?.(false);

      // Auto-restart if enabled (using ref to get current value)
      if (enabledRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch {
            // Recognition restart failed - silently continue
          }
        }, 100);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setHasPermission(false);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' ';
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      const currentText = (finalTranscriptRef.current + finalTranscript + interimTranscript).toLowerCase().trim();
      setTranscript(currentText);

      // MODE 1: Wake word required (modal closed)
      if (requireWakeWordRef.current) {
        // Check for wake word - only when we have a final result
        if (!wakeWordDetectedRef.current && finalTranscript && currentText.includes(wakeWord.toLowerCase())) {
          // Clean the transcript to remove the wake word
          const textWithoutWakeWord = currentText
            .replace(new RegExp(wakeWord.toLowerCase(), 'gi'), '')
            .trim();

          // ALWAYS call the wake word callback to open modal and show greeting
          onWakeWordDetected?.();

          // Only process additional text if it exists AND is not just the wake word
          if (textWithoutWakeWord && textWithoutWakeWord.length > 0) {
            // Mark wake word as detected to process the command in next result
            wakeWordDetectedRef.current = true;
            finalTranscriptRef.current = textWithoutWakeWord;
          } else {
            // No additional text, just reset
            finalTranscriptRef.current = '';
            wakeWordDetectedRef.current = false;
            setTranscript('');
          }
          return;
        }

        // If wake word was detected and we're accumulating more transcript
        if (wakeWordDetectedRef.current && finalTranscript) {
          finalTranscriptRef.current += finalTranscript;

          // Check if user stopped speaking (final result)
          if (event.results[event.results.length - 1].isFinal) {
            const cleanTranscript = finalTranscriptRef.current
              .replace(new RegExp(wakeWord, 'gi'), '')
              .trim();

            if (cleanTranscript && cleanTranscript.length > 0) {
              onTranscriptComplete?.(cleanTranscript);
            }

            finalTranscriptRef.current = '';
            wakeWordDetectedRef.current = false;
          }
        }
      }
      // MODE 2: No wake word required (modal open) - transcribe everything
      else {
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;

          // Check if user stopped speaking (final result)
          if (event.results[event.results.length - 1].isFinal) {
            const cleanTranscript = finalTranscriptRef.current.trim();

            // Check if user said "Hey Libia" even with modal open
            if (cleanTranscript.toLowerCase().includes(wakeWord.toLowerCase())) {
              // Remove wake word
              const textWithoutWakeWord = cleanTranscript
                .replace(new RegExp(wakeWord.toLowerCase(), 'gi'), '')
                .trim();

              // Call wake word callback (shows greeting)
              onWakeWordDetected?.();

              // If there's additional text, process it
              if (textWithoutWakeWord && textWithoutWakeWord.length > 0) {
                onTranscriptComplete?.(textWithoutWakeWord);
              }
            } else if (cleanTranscript) {
              // Normal transcript without wake word
              onTranscriptComplete?.(cleanTranscript);
            }

            finalTranscriptRef.current = '';
          }
        }
      }
    };

    recognitionRef.current = recognition;
    isInitializedRef.current = true;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]); // Only initialize once, callbacks are stable via refs

  // Start recognition
  const startListening = useCallback(async () => {
    console.log('🎤 startListening called', { isSupported, hasPermission, recognitionInitialized: !!recognitionRef.current });

    if (!isSupported) {
      alert('Tu navegador no soporta reconocimiento de voz');
      return false;
    }

    // Check permission first
    if (!hasPermission) {
      console.log('🎤 No permission, requesting...');
      const granted = await requestPermission();
      if (!granted) {
        alert('Necesitas permitir el acceso al micrófono para usar la voz');
        return false;
      }
      // Wait for permission to be fully registered
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Now start recognition
    try {
      if (recognitionRef.current && !isListening) {
        console.log('🎤 Starting recognition...');
        recognitionRef.current.start();
        return true;
      } else if (isListening) {
        console.log('🎤 Already listening');
        return true;
      }
      return false;
    } catch (error: unknown) {
      const err = error as Error;
      console.error('❌ Recognition start error:', err);
      // If error is "already started", that's actually OK
      if (err.message?.includes('already')) {
        return true;
      }
      return false;
    }
  }, [isSupported, hasPermission, isListening, requestPermission]);

  // Stop recognition
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    onListening?.(false);
  }, [onListening]);

  return {
    isListening,
    transcript,
    hasPermission,
    isSupported,
    startListening,
    stopListening,
    requestPermission,
  };
};

