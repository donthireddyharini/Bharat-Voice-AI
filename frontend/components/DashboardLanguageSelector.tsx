"use client";

import { useState, useRef, useEffect } from "react";
import { Language } from "@/lib/types";

export interface LanguageOption {
  code: Language;
  label: string;
  native: string;
  region: string;
}

export const ALL_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", native: "English", region: "All India" },
  { code: "te", label: "Telugu", native: "తెలుగు", region: "Andhra & Telangana" },
  { code: "hi", label: "Hindi", native: "हिन्दी", region: "North & Central India" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", region: "Karnataka" },
  { code: "ta", label: "Tamil", native: "தமிழ்", region: "Tamil Nadu" },
  { code: "mr", label: "Marathi", native: "मराठी", region: "Maharashtra" },
  { code: "bn", label: "Bengali", native: "বাংলা", region: "West Bengal" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", region: "Gujarat" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", region: "Kerala" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", region: "Punjab" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ", region: "Odisha" },
];

interface DashboardLanguageSelectorProps {
  value: Language;
  onChange: (lang: Language) => void;
}

export default function DashboardLanguageSelector({ value, onChange }: DashboardLanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = ALL_LANGUAGES.find((l) => l.code === value) || ALL_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (lang: Language) => {
    onChange(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block z-50" ref={containerRef}>
      {/* Interactive Badge Button (Matches dashboard pill style with dropdown affordance) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group inline-flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-saffron/20 hover:bg-saffron/30 text-saffron border border-saffron/40 hover:border-saffron/70 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-glow"
        title="Change application language (11 Indian Languages)"
        aria-expanded={isOpen}
      >
        <span className="text-xs group-hover:rotate-12 transition-transform">🌐</span>
        <span className="font-extrabold">{currentLang.native}</span>
        <span className={`text-[9px] text-saffron/80 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Floating Language Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl glass-strong border border-saffron/30 shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-2.5 backdrop-blur-2xl z-50 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-2.5 py-1.5 mb-1.5 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🗣️</span>
              <span className="text-xs font-bold text-bone">Select Language / భాషను ఎంచుకోండి</span>
            </div>
            <span className="text-[10px] text-mist/70 font-mono">11 Languages</span>
          </div>

          {/* Languages Grid */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {ALL_LANGUAGES.map((lang) => {
              const isSelected = lang.code === value;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-saffron/25 via-saffron/15 to-transparent border border-saffron/50 text-white shadow-glow"
                      : "hover:bg-white/8 text-bone/90 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{isSelected ? "✨" : "🇮🇳"}</span>
                    <div>
                      <div className="text-sm font-bold text-bone flex items-center gap-1.5">
                        <span>{lang.native}</span>
                        {lang.native !== lang.label && (
                          <span className="text-[11px] text-mist/70 font-normal">({lang.label})</span>
                        )}
                      </div>
                      <div className="text-[10px] text-mist/60">{lang.region}</div>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-saffron text-gray-900 font-bold text-xs flex items-center justify-center shadow-glow">
                      ✓
                    </span>
                  ) : (
                    <span className="text-xs text-mist/40 group-hover:text-mist">→</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-2 pt-2 border-t border-white/10 px-2 flex items-center justify-between text-[10px] text-mist/60">
            <span>Entire website will update automatically</span>
            <span className="text-cyber font-semibold">100% Native</span>
          </div>
        </div>
      )}
    </div>
  );
}
