"use client";

interface VoiceButtonProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export default function VoiceButton({ isListening, onStart, onStop, disabled }: VoiceButtonProps) {
  return (
    <button
      onClick={isListening ? onStop : onStart}
      disabled={disabled}
      aria-label={isListening ? "Stop listening" : "Start voice input"}
      className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 disabled:opacity-40 group ${
        isListening
          ? "bg-gradient-to-br from-gulal to-amethyst shadow-glowNeon scale-105"
          : "bg-gradient-to-br from-saffron to-gulal hover:shadow-glow hover:scale-110"
      }`}
    >
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full border border-gulal/60 animate-ping" style={{ animationDuration: '1.5s' }} />
          <span className="absolute inset-[-8px] rounded-full border border-amethyst/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.2s' }} />
          <span className="absolute inset-[-16px] rounded-full border border-saffron/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.4s' }} />
        </>
      )}
      {isListening ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="relative z-10">
          <rect x="6" y="6" width="12" height="12" rx="2" fill="white" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all">
          <path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3z" fill="white" />
          <path d="M19 11a7 7 0 01-14 0M12 18v3" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
