"use client";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export default function BrandLogo({ size = "md", className = "", showText = true }: BrandLogoProps) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg sm:text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Futuristic Sovereign AI Soundwave Chakra Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0 transition-transform duration-300 group-hover:scale-105 active:scale-95`}>
        {/* Ambient Glow Halo */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-saffron via-gulal to-amethyst opacity-80 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-500" />
        
        {/* Core Icon Badge */}
        <div className="relative w-full h-full rounded-2xl bg-[#070D1E] border border-white/20 p-2 flex items-center justify-center shadow-inner overflow-hidden">
          {/* Subtle Rotating Gradient Ring */}
          <div className="absolute inset-0 bg-gradient-to-br from-saffron/20 via-transparent to-cyber/20 opacity-70" />
          
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full relative z-10"
          >
            <defs>
              <linearGradient id="bvSaffron" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF8A00" />
                <stop offset="100%" stopColor="#FF3E6C" />
              </linearGradient>
              <linearGradient id="bvCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#8040F5" />
              </linearGradient>
              <linearGradient id="bvCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#00E5FF" />
              </linearGradient>
            </defs>

            {/* Outer Soundwave / Chakra Rings */}
            <circle cx="24" cy="24" r="21" stroke="url(#bvSaffron)" strokeWidth="1.8" strokeDasharray="3 3" opacity="0.8" />
            <circle cx="24" cy="24" r="16.5" stroke="url(#bvCyan)" strokeWidth="1.6" opacity="0.9" />

            {/* Neural Voice Spectrum Bars in Center */}
            <rect x="13" y="20" width="2.6" height="8" rx="1.3" fill="url(#bvSaffron)" />
            <rect x="17.5" y="15" width="2.6" height="18" rx="1.3" fill="url(#bvSaffron)" />
            <rect x="22" y="11" width="4" height="26" rx="2" fill="url(#bvCenter)" />
            <rect x="27.9" y="15" width="2.6" height="18" rx="1.3" fill="url(#bvCyan)" />
            <rect x="32.4" y="20" width="2.6" height="8" rx="1.3" fill="url(#bvCyan)" />

            {/* Core Neural Pulse Dot */}
            <circle cx="24" cy="24" r="2.2" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-black ${textSizes[size]} tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-bone via-white to-saffron group-hover:from-saffron group-hover:to-bone transition-all duration-300 leading-tight`}>
            BharathVoice AI
          </span>
          <span className="text-[9px] text-mist/80 tracking-[0.16em] uppercase font-semibold -mt-0.5 hidden sm:block">
            Voice-First Citizen Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
