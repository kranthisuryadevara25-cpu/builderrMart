import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Type declarations for Web Speech API
interface SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
  readonly isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

interface UseVoiceSearchProps {
  onResult: (transcript: string) => void;
  language?: string;
}

interface BrowserCompatibility {
  chrome: boolean;
  edge: boolean;
  firefox: boolean;
  safari: boolean;
  mobile: boolean;
  supported: boolean;
  recommendedBrowser: string;
}

interface UseVoiceSearchReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  getBrowserCompatibility: () => BrowserCompatibility;
  getDebugInfo: () => object;
}

export function useVoiceSearch({ onResult, language = 'en-US' }: UseVoiceSearchProps): UseVoiceSearchReturn & { 
  getBrowserCompatibility: () => object;
  getDebugInfo: () => object;
} {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Check if Speech Recognition is supported
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  
  // Enhanced debugging and compatibility detection
  useEffect(() => {
    const debugInfo = {
      windowExists: typeof window !== 'undefined',
      speechRecognition: typeof window !== 'undefined' && 'SpeechRecognition' in window,
      webkitSpeechRecognition: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window,
      isSupported,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'N/A',
      language: typeof navigator !== 'undefined' ? navigator.language : 'N/A',
      onLine: typeof navigator !== 'undefined' ? navigator.onLine : true
    };
    console.log('🎤 Voice Search Support Status:', debugInfo);
    
    // Store debug info globally for access
    if (typeof window !== 'undefined') {
      (window as any).__voiceSearchDebug = debugInfo;
    }
  }, [isSupported]);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognitionClass();

    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = language;
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onstart = () => {
      setIsListening(true);
    };

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);

      if (finalTranscript) {
        onResult(finalTranscript);
        setIsListening(false);
      }
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('🎤 Speech recognition error:', event.error, event);
      setIsListening(false);
      
      let errorMessage = 'Voice recognition failed. Please try again.';
      let troubleshootingTip = '';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking clearly.';
          troubleshootingTip = 'Make sure your microphone is working and speak directly into it.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not available. Please check your settings.';
          troubleshootingTip = 'Check if another application is using your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please enable microphone permissions.';
          troubleshootingTip = 'Click the microphone icon in your browser\'s address bar to allow access.';
          break;
        case 'network':
          errorMessage = 'Network error during voice recognition.';
          troubleshootingTip = 'Check your internet connection and try again.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Voice recognition service not available.';
          troubleshootingTip = 'Try using a supported browser like Chrome or Edge.';
          break;
      }

      toast({
        title: "Voice Search Error",
        description: `${errorMessage} ${troubleshootingTip}`,
        variant: "destructive",
      });
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
      setTranscript('');
    };

    setRecognition(recognitionInstance);

    return () => {
      recognitionInstance.stop();
    };
  }, [isSupported, language, onResult, toast]);

  const startListening = useCallback(() => {
    if (!recognition || isListening) return;

    try {
      setTranscript('');
      console.log('🎤 Starting voice recognition...');
      recognition.start();
      toast({
        title: "🎤 Voice Search Active",
        description: "Speak your search query clearly...",
      });
    } catch (error) {
      console.error('🎤 Error starting voice recognition:', error);
      toast({
        title: "Voice Search Error",
        description: "Failed to start voice recognition. Check browser compatibility.",
        variant: "destructive",
      });
    }
  }, [recognition, isListening, toast]);

  const stopListening = useCallback(() => {
    if (!recognition || !isListening) return;
    recognition.stop();
  }, [recognition, isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const getBrowserCompatibility = useCallback(() => {
    const ua = navigator.userAgent;
    const compatibility = {
      chrome: /Chrome/.test(ua) && !/Edge/.test(ua),
      edge: /Edge/.test(ua),
      firefox: /Firefox/.test(ua),
      safari: /Safari/.test(ua) && !/Chrome/.test(ua),
      mobile: /Mobile|Android|iPhone|iPad/.test(ua),
      supported: isSupported,
      recommendedBrowser: 'Chrome or Edge for best voice search experience'
    };
    return compatibility;
  }, [isSupported]);

  const getDebugInfo = useCallback(() => {
    return {
      isListening,
      isSupported,
      transcript,
      language,
      compatibility: getBrowserCompatibility(),
      timestamp: new Date().toISOString()
    };
  }, [isListening, isSupported, transcript, language, getBrowserCompatibility]);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    getBrowserCompatibility,
    getDebugInfo,
  };
}

// Extend the Window interface to include Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}