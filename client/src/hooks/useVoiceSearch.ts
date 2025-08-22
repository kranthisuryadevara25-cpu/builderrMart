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

export interface Language {
  code: string;
  name: string;
  flag: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', region: 'US' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧', region: 'UK' },
  { code: 'en-IN', name: 'English (India)', flag: '🇮🇳', region: 'India' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)', flag: '🇮🇳', region: 'India' },
  { code: 'te-IN', name: 'తెలుగు (Telugu)', flag: '🇮🇳', region: 'India' },
  { code: 'ta-IN', name: 'தமிழ் (Tamil)', flag: '🇮🇳', region: 'India' },
  { code: 'bn-IN', name: 'বাংলা (Bengali)', flag: '🇮🇳', region: 'India' },
  { code: 'mr-IN', name: 'मराठी (Marathi)', flag: '🇮🇳', region: 'India' },
  { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳', region: 'India' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳', region: 'India' },
  { code: 'es-ES', name: 'Español (Spanish)', flag: '🇪🇸', region: 'Spain' },
  { code: 'fr-FR', name: 'Français (French)', flag: '🇫🇷', region: 'France' },
  { code: 'de-DE', name: 'Deutsch (German)', flag: '🇩🇪', region: 'Germany' },
  { code: 'ar-SA', name: 'العربية (Arabic)', flag: '🇸🇦', region: 'Saudi Arabia' },
  { code: 'zh-CN', name: '中文 (Chinese)', flag: '🇨🇳', region: 'China' },
  { code: 'ja-JP', name: '日本語 (Japanese)', flag: '🇯🇵', region: 'Japan' },
  { code: 'ko-KR', name: '한국어 (Korean)', flag: '🇰🇷', region: 'Korea' },
];

interface UseVoiceSearchProps {
  onResult: (transcript: string) => void;
  language?: string;
  onLanguageDetected?: (detectedLanguage: string) => void;
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
  currentLanguage: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  changeLanguage: (languageCode: string) => void;
  getSupportedLanguages: () => Language[];
  getBrowserCompatibility: () => BrowserCompatibility;
  getDebugInfo: () => object;
}

export function useVoiceSearch({ onResult, language = 'en-US', onLanguageDetected }: UseVoiceSearchProps): UseVoiceSearchReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Memoize callbacks to prevent infinite re-renders
  const stableOnResult = useCallback((text: string) => {
    if (onResult) {
      onResult(text);
    }
  }, []); // Empty dependency array to prevent infinite loop

  const stableOnLanguageDetected = useCallback((lang: string) => {
    if (onLanguageDetected) {
      onLanguageDetected(lang);
    }
  }, []); // Empty dependency array to prevent infinite loop

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
    recognitionInstance.lang = currentLanguage;
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
        stableOnResult(finalTranscript);
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
  }, [isSupported, language, stableOnResult, toast]);

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

  // Language change handler
  const changeLanguage = useCallback((languageCode: string) => {
    setCurrentLanguage(languageCode);
    if (recognition) {
      recognition.lang = languageCode;
    }
    console.log(`🎤 Language changed to: ${languageCode}`);
    onLanguageDetected?.(languageCode);
  }, [recognition, onLanguageDetected]);

  // Get supported languages
  const getSupportedLanguages = useCallback(() => {
    return SUPPORTED_LANGUAGES;
  }, []);

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
      currentLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES.length,
      compatibility: getBrowserCompatibility(),
      timestamp: new Date().toISOString()
    };
  }, [isListening, isSupported, transcript, currentLanguage, getBrowserCompatibility]);

  return {
    isListening,
    isSupported,
    transcript,
    currentLanguage,
    startListening,
    stopListening,
    toggleListening,
    changeLanguage,
    getSupportedLanguages,
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