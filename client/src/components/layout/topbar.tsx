import { useState } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoiceSearchInput } from "@/components/ui/voice-search-input";
import { QuickLanguageSwitcher } from "@/components/ui/language-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Bell, ChevronDown, Mic, MicOff } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState("en-US");

  if (!user) return null;

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-surface border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          {subtitle && (
            <span className="text-sm text-gray-500">{subtitle}</span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Multilingual Voice Search */}
          <div className="flex items-center gap-2">
            <VoiceSearchInput
              placeholder="Search products, categories..."
              className="w-80"
              value={searchQuery}
              onChange={setSearchQuery}
              testId="topbar-search"
              language={voiceLanguage}
              onLanguageChange={setVoiceLanguage}
              showLanguageSelector={false}
            />
            
            {/* Quick Language Switcher */}
            <QuickLanguageSwitcher
              currentLanguage={voiceLanguage}
              onLanguageChange={setVoiceLanguage}
              className="border-l pl-2"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-400" />
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getUserInitials(user.username)}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
