import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type Language } from '@/hooks/useVoiceSearch';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
  showFlag?: boolean;
  showRegion?: boolean;
}

export function LanguageSelector({
  currentLanguage,
  onLanguageChange,
  variant = 'default',
  className,
  showFlag = true,
  showRegion = false
}: LanguageSelectorProps) {
  const getCurrentLanguageInfo = (): Language => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) 
      || SUPPORTED_LANGUAGES[0];
  };

  const currentLangInfo = getCurrentLanguageInfo();

  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-6 p-1 text-xs", className)}
        onClick={() => {
          // Cycle through first few popular languages
          const quickLanguages = ['en-US', 'hi-IN', 'es-ES', 'fr-FR', 'de-DE'];
          const currentIndex = quickLanguages.indexOf(currentLanguage);
          const nextIndex = (currentIndex + 1) % quickLanguages.length;
          onLanguageChange(quickLanguages[nextIndex]);
        }}
        title={`Voice language: ${currentLangInfo.name}`}
      >
        {showFlag && currentLangInfo.flag}
        <span className="ml-1">{currentLangInfo.code.split('-')[0]}</span>
      </Button>
    );
  }

  if (variant === 'compact') {
    return (
      <Select value={currentLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className={cn("w-auto min-w-[100px] h-8", className)}>
          <div className="flex items-center gap-1">
            {showFlag && <span className="text-sm">{currentLangInfo.flag}</span>}
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          <div className="p-2 text-xs text-gray-600 border-b">
            🎤 Voice Search Languages
          </div>
          {SUPPORTED_LANGUAGES.map((language) => (
            <SelectItem
              key={language.code}
              value={language.code}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-2 w-full">
                {showFlag && <span>{language.flag}</span>}
                <span className="flex-1">{language.name}</span>
                {showRegion && (
                  <Badge variant="outline" className="text-xs">
                    {language.region}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Default variant
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Globe className="w-4 h-4 text-gray-500" />
      <Select value={currentLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[200px]">
          <div className="flex items-center gap-2">
            {showFlag && <span>{currentLangInfo.flag}</span>}
            <SelectValue placeholder="Select voice language" />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-80 overflow-y-auto">
          <div className="p-3 text-sm font-medium text-gray-900 border-b bg-gray-50">
            🎤 Select Voice Search Language
          </div>
          <div className="p-2">
            <div className="text-xs text-gray-600 mb-2 font-medium">Popular Languages:</div>
            {SUPPORTED_LANGUAGES.slice(0, 6).map((language) => (
              <SelectItem
                key={`popular-${language.code}`}
                value={language.code}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3 w-full">
                  {showFlag && <span className="text-lg">{language.flag}</span>}
                  <div className="flex-1">
                    <div className="font-medium">{language.name}</div>
                    <div className="text-xs text-gray-500">{language.code}</div>
                  </div>
                  {showRegion && (
                    <Badge variant="outline" className="text-xs">
                      {language.region}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </div>
          <div className="p-2 border-t">
            <div className="text-xs text-gray-600 mb-2 font-medium">All Languages:</div>
            {SUPPORTED_LANGUAGES.slice(6).map((language) => (
              <SelectItem
                key={language.code}
                value={language.code}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2 w-full">
                  {showFlag && <span>{language.flag}</span>}
                  <span className="flex-1 text-sm">{language.name}</span>
                  {showRegion && (
                    <Badge variant="outline" className="text-xs">
                      {language.region}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}

// Quick language switcher for header/toolbar use
export function QuickLanguageSwitcher({
  currentLanguage,
  onLanguageChange,
  className
}: {
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  className?: string;
}) {
  const popularLanguages = ['en-US', 'hi-IN', 'es-ES', 'fr-FR', 'ar-SA'];
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {popularLanguages.map((langCode) => {
        const language = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
        if (!language) return null;
        
        return (
          <Button
            key={langCode}
            variant={currentLanguage === langCode ? "default" : "ghost"}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => onLanguageChange(langCode)}
            title={`Switch to ${language.name}`}
          >
            {language.flag}
          </Button>
        );
      })}
    </div>
  );
}