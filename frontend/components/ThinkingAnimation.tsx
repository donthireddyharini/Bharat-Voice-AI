import { AssistantState } from "@/lib/types";

const LABELS: Partial<Record<AssistantState, string>> = {
  listening: "Listening…",
  understanding: "Understanding…",
  searching: "Searching trusted sources…",
  generating: "Preparing answer…",
  speaking: "Speaking…",
};

export default function ThinkingAnimation({ state }: { state: AssistantState }) {
  const label = LABELS[state];
  if (!label) return null;

  return (
    <div className="w-full flex justify-start items-center gap-3 my-2 animate-fadeIn">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber via-neon to-amethyst flex items-center justify-center text-xs shadow-glowCyan shrink-0 animate-pulse">
        🎙️
      </div>
      <div className="flex items-center gap-4 glass-strong rounded-2xl rounded-tl-sm px-5 py-3.5 w-fit border border-saffron/30 shadow-[0_4px_25px_rgba(255,122,61,0.2)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-saffron/10 via-amethyst/10 to-transparent pointer-events-none" />
        <div className="flex gap-1.5 relative z-10">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-br from-saffron via-gulal to-amethyst shadow-glowNeon animate-waveform"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-bone tracking-wide relative z-10 drop-shadow-sm">{label}</span>
      </div>
    </div>
  );
}
