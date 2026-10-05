"use client";

import BrandLogo from "@/components/BrandLogo";
import { useLanguage } from "@/lib/useLanguage";
import { ALL_LANGUAGES } from "@/components/LanguageSelector";

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="mt-20 relative">
      <div className="bg-gradient-to-r from-saffron via-gulal to-amethyst h-px w-full opacity-60 shadow-glow" />
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-mist">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" showText={false} />
          <span className="font-medium text-xs sm:text-sm">
            BharathVoice AI — {t.heroBadge || "Voice-First Citizen Intelligence Platform"}
          </span>
        </div>
        <div className="flex gap-2 sm:gap-2.5 flex-wrap justify-center">
          {ALL_LANGUAGES.map((l) => {
            const isActive = language === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-saffron/20 border-saffron text-bone shadow-glow"
                    : "bg-white/5 border-white/10 hover:border-saffron/50 text-mist hover:text-bone"
                }`}
                title={`Switch website to ${l.label}`}
              >
                <span className={`w-1 h-1 rounded-full ${isActive ? "bg-saffron animate-pulse" : "bg-white/20"}`} />
                <span>{l.native}</span>
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
