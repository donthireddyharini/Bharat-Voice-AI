"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Language } from "@/lib/types";

export const PRIMARY_LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

export const EXTRA_LANGUAGES: { code: Language; label: string; native: string; region: string }[] = [
  { code: "ta", label: "Tamil", native: "தமிழ்", region: "Tamil Nadu" },
  { code: "mr", label: "Marathi", native: "मराठी", region: "Maharashtra" },
  { code: "bn", label: "Bengali", native: "বাংলা", region: "West Bengal" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", region: "Gujarat" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", region: "Kerala" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", region: "Punjab" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ", region: "Odisha" },
];

export const ALL_LANGUAGES = [...PRIMARY_LANGUAGES, ...EXTRA_LANGUAGES];

interface LanguageSelectorProps {
  value: Language;
  onChange: (lang: Language) => void;
  compact?: boolean;
}

export default function LanguageSelector({ value, onChange, compact }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (!moreBtnRef.current) return;
    const rect = moreBtnRef.current.getBoundingClientRect();
    const width = typeof window !== "undefined" && window.innerWidth < 640 ? 290 : 340;
    let right = window.innerWidth - rect.right;
    if (right < 12) right = 12;
    if (window.innerWidth - right < width + 12) {
      right = Math.max(12, window.innerWidth - width - 12);
    }
    setDropdownCoords({
      top: rect.bottom + 8,
      right: right,
    });
  };

  // Close dropdown on outside click or reposition on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        moreBtnRef.current &&
        !moreBtnRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      updatePosition();
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const activeExtraLang = EXTRA_LANGUAGES.find((l) => l.code === value);
  const isExtraActive = !!activeExtraLang;

  return (
    <div className="relative inline-flex items-center z-50">
      <div className={`flex ${compact ? "gap-1.5 sm:gap-2" : "gap-2.5"} flex-wrap items-center`}>
        {/* Primary Language Buttons */}
        {PRIMARY_LANGUAGES.map((l) => {
          const isActive = value === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                onChange(l.code);
                setIsOpen(false);
              }}
              className={`relative overflow-hidden rounded-full font-medium transition-all duration-300 active:scale-95 cursor-pointer ${
                compact ? "px-3 py-1 text-xs" : "px-4 sm:px-5 py-2 text-xs sm:text-sm"
              } ${
                isActive
                  ? "bg-gradient-to-r from-saffron/30 to-gulal/30 text-bone border-saffron shadow-glow"
                  : "bg-white/5 border-white/10 text-mist hover:border-white/30 hover:bg-white/10 hover:text-bone hover:-translate-y-0.5"
              } border backdrop-blur-md`}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-full shadow-[inset_0_0_12px_rgba(255,153,51,0.4)] pointer-events-none" />
              )}
              <span className="relative z-10">{l.native}</span>
            </button>
          );
        })}

        {/* More Languages Button */}
        <button
          ref={moreBtnRef}
          type="button"
          onClick={() => {
            updatePosition();
            setIsOpen((prev) => !prev);
          }}
          className={`relative overflow-hidden rounded-full font-medium transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
            compact ? "px-3 py-1 text-xs" : "px-4 sm:px-5 py-2 text-xs sm:text-sm"
          } ${
            isExtraActive
              ? "bg-gradient-to-r from-amethyst/30 to-cyber/30 text-bone border-amethyst shadow-[0_0_15px_rgba(157,78,221,0.35)]"
              : isOpen
              ? "bg-white/15 border-saffron/50 text-bone"
              : "bg-white/5 border-white/15 text-mist hover:border-white/30 hover:bg-white/10 hover:text-bone hover:-translate-y-0.5"
          } border backdrop-blur-md`}
        >
          {isExtraActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyber animate-pulse" />
          )}
          <span className="relative z-10">
            {isExtraActive ? `${activeExtraLang.native}` : "+ More"}
          </span>
          <span className={`text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>
      </div>

      {/* Dropdown Menu for Extra Languages Portaled into document.body with ultimate z-index */}
      {isOpen && mounted && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: `${dropdownCoords.top}px`,
            right: `${dropdownCoords.right}px`,
            zIndex: 9999999,
          }}
          className="min-w-[280px] sm:min-w-[340px] max-w-[calc(100vw-24px)] bg-[#0c0d14]/98 rounded-2xl border border-white/25 p-3 sm:p-4 shadow-[0_25px_80px_rgba(0,0,0,0.98)] backdrop-blur-3xl animate-scaleIn ring-1 ring-white/10"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-xs font-bold text-bone flex items-center gap-1.5">
              <span>🇮🇳</span>
              <span>More Indian Languages</span>
            </span>
            <span className="text-[10px] text-mist uppercase tracking-wider font-semibold">
              Voice &amp; Text
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
            {EXTRA_LANGUAGES.map((l) => {
              const isActive = value === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    onChange(l.code);
                    setIsOpen(false);
                  }}
                  className={`text-left p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-between ${
                    isActive
                      ? "bg-gradient-to-r from-saffron/20 to-gulal/20 border-saffron text-bone shadow-[0_0_15px_rgba(255,122,61,0.25)]"
                      : "bg-white/5 border-white/10 text-mist hover:border-white/25 hover:bg-white/10 hover:text-bone"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-bone flex items-center gap-1.5">
                      <span>{l.native}</span>
                      <span className="text-[10px] font-normal text-mist">({l.label})</span>
                    </div>
                    <div className="text-[10px] text-mist/70 mt-0.5">{l.region}</div>
                  </div>
                  {isActive && <span className="text-xs text-cyber font-bold">✓</span>}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/10 text-[11px] text-mist/70 flex items-center justify-between">
            <span>✨ Live Native Speech</span>
            <span className="text-cyber font-medium">11 Languages</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
