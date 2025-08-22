import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, Search, AlertTriangle } from 'lucide-react';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { cn } from '@/lib/utils';

interface VoiceSearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  testId?: string;
  language?: string;
  showDebugInfo?: boolean;
}

export function VoiceSearchInput({
  placeholder = "Search...",
  value,
  onChange,
  className,
  testId,
  language = 'en-US',
  showDebugInfo = false
}: VoiceSearchInputProps) {
  const { 
    isListening, 
    isSupported, 
    transcript, 
    toggleListening, 
    getBrowserCompatibility, 
    getDebugInfo 
  } = useVoiceSearch({
    onResult: (transcript) => {
      console.log('🎤 Voice search result:', transcript);
      onChange(transcript);
    },
    language
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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 border",
            !isSupported ? "text-gray-400 cursor-not-allowed bg-gray-100" :
            isListening ? "text-white bg-red-500 hover:bg-red-600 animate-pulse" : "text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200"
          )}
          onClick={handleMicClick}
          disabled={!isSupported}
          title={
            !isSupported ? "Voice search not supported - check browser compatibility" :
            isListening ? "🎤 Recording... Click to stop" : "🎤 Click to start voice search"
          }
          data-testid={`${testId}-voice-button`}
        >
          {isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className={cn("h-4 w-4", !isSupported && "opacity-50")} />
          )}
        </Button>
      </div>
      
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