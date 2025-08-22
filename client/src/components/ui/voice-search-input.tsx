import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Search } from 'lucide-react';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { cn } from '@/lib/utils';

interface VoiceSearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  testId?: string;
  language?: string;
}

export function VoiceSearchInput({
  placeholder = "Search...",
  value,
  onChange,
  className,
  testId,
  language = 'en-US'
}: VoiceSearchInputProps) {
  const { isListening, isSupported, transcript, toggleListening } = useVoiceSearch({
    onResult: (transcript) => {
      onChange(transcript);
    },
    language
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
      <Input
        placeholder={isListening ? `Listening... ${transcript}` : placeholder}
        value={isListening ? transcript || value : value}
        onChange={handleInputChange}
        className={cn("pl-10 pr-12", className)}
        data-testid={testId}
      />
      {isSupported && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0",
            isListening ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-gray-500 hover:text-blue-500"
          )}
          onClick={toggleListening}
          title={isListening ? "Stop voice search" : "Start voice search"}
          data-testid={`${testId}-voice-button`}
        >
          {isListening ? (
            <MicOff className="h-4 w-4 animate-pulse" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}