import React, { useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, Search, AlertTriangle } from 'lucide-react';
import { useVoiceSearch, SUPPORTED_LANGUAGES } from '@/hooks/useVoiceSearch';
import { LanguageSelector } from '@/components/ui/language-selector';
import { cn } from '@/lib/utils';

interface VoiceSearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  testId?: string;
  language?: string;
  showDebugInfo?: boolean;
  showLanguageSelector?: boolean;
  languageSelectorVariant?: 'default' | 'compact' | 'minimal';
  onLanguageChange?: (language: string) => void;
}

export function VoiceSearchInput({
  placeholder = "Search...",
  value,
  onChange,
  className,
  testId,
  language = 'en-US',
  showDebugInfo = false,
  showLanguageSelector = false,
  languageSelectorVariant = 'compact',
  onLanguageChange
}: VoiceSearchInputProps) {
  // Memoize callbacks to prevent infinite re-renders
  const stableOnResult = useCallback((transcript: string) => {
    console.log('🎤 Voice search result:', transcript);
    onChange(transcript);
  }, [onChange]);

  const stableOnLanguageChange = useCallback((lang: string) => {
    onLanguageChange?.(lang);
  }, [onLanguageChange]);

  const { 
    isListening, 
    isSupported, 
    transcript, 
    currentLanguage,
    toggleListening, 
    changeLanguage,
    getBrowserCompatibility, 
    getDebugInfo 
  } = useVoiceSearch({
    onResult: stableOnResult,
    language,
    onLanguageDetected: stableOnLanguageChange
  });
  
  // Enhanced debugging information
  const debugInfo = showDebugInfo ? getDebugInfo() : null;
  const compatibility = getBrowserCompatibility();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  // Enhanced microphone button click with debugging
  const handleMicClick = () => {
    console.log('🎤 Microphone clicked:', {
      isSupported,
      isListening,
      compatibility
    });
    
    if (!isSupported) {
      console.warn('🎤 Voice search not supported in this browser');
      return;
    }
    
    toggleListening();
  };

  // Helper functions for multilingual support
  const getListeningMessage = () => {
    const messages: Record<string, string> = {
      'hi': 'सुन रहा है',
      'te': 'వिನಡం',
      'ta': 'கேட்கிறது',
      'bn': 'শুনছি',
      'mr': 'ऍकत आहे',
      'gu': 'સાંભળે છે',
      'kn': 'ಕೇಳುತ್ತಿದ್ದೇ',
      'es': 'Escuchando',
      'fr': 'Écoute',
      'de': 'Hört zu',
      'ar': 'يستمع',
      'zh': '在听',
      'ja': '聞いています',
      'ko': '듣고 있습니다',
    };
    const langPrefix = currentLanguage.split('-')[0];
    return messages[langPrefix] || 'Listening';
  };

  const getVoiceButtonTitle = () => {
    if (!isSupported) return '🎤 Voice search (Browser not supported)';
    if (isListening) return `🎤 ${getListeningMessage()}... Click to stop`;
    return `🎤 Click to start voice search (${getCurrentLanguageName()})`;
  };

  const getCurrentLanguageName = () => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);
    return lang ? lang.name : currentLanguage;
  };
  
  return (
    <div className="space-y-2">
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
        <Input
          placeholder={isListening ? `🎤 Listening... ${transcript}` : placeholder}
          value={isListening ? transcript || value : value}
          onChange={handleInputChange}
          className={cn("pl-10 pr-12", className)}
          data-testid={testId}
        />
        {/* Enhanced microphone button with better visibility */}
        {/* ALWAYS VISIBLE MICROPHONE BUTTON */}
        <Button
          type="button"
          variant="default"
          size="sm"
          className={cn(
            "absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 border-2",
            isListening ? "bg-red-500 text-white border-red-600 animate-pulse shadow-lg" : 
            "bg-blue-500 text-white border-blue-600 hover:bg-blue-600 shadow-md"
          )}
          onClick={handleMicClick}
          title={
            !isSupported ? "🎤 Voice search (Browser not supported)" :
            isListening ? "🎤 Recording... Click to stop" : "🎤 Click to start voice search"
          }
          data-testid={`${testId}-voice-button`}
        >
          {isListening ? (
            <MicOff className="h-4 w-4 drop-shadow-sm" />
          ) : (
            <Mic className="h-4 w-4 drop-shadow-sm" />
          )}
        </Button>
      </div>

      {/* Language Selector */}
      {showLanguageSelector && (
        <div className="flex justify-center">
          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={changeLanguage}
            variant={languageSelectorVariant}
          />
        </div>
      )}
      
      {/* Browser compatibility warning */}
      {!isSupported && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-sm">
            Voice search not supported in your browser. Try Chrome or Edge for best experience.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Debug information */}
      {showDebugInfo && debugInfo && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <details>
            <summary className="cursor-pointer">🔍 Voice Search Debug</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}