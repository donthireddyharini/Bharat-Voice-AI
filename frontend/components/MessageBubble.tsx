import { ChatMessage, Language } from "@/lib/types";
import SchemeCard from "./SchemeCard";

interface MessageBubbleProps {
  message: ChatMessage;
  currentLanguage?: Language;
}

export default function MessageBubble({ message, currentLanguage }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const activeLanguage = currentLanguage || message.language || "en";

  if (isUser) {
    return (
      <div className="w-full flex justify-end items-end gap-3 my-1">
        <div className="max-w-[85%] md:max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-saffron/25 via-gulal/20 to-amethyst/20 border border-saffron/40 px-5 py-3.5 text-sm text-bone shadow-[0_4px_25px_rgba(255,122,61,0.2)] backdrop-blur-md transition-all">
          <p className="leading-relaxed whitespace-pre-wrap select-text">{message.content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron to-gulal flex items-center justify-center text-xs font-bold text-white shadow-glow shrink-0 mb-0.5">
          👤
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-start items-start gap-3 my-1">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber via-neon to-amethyst flex items-center justify-center text-xs shadow-glowCyan shrink-0 mt-1">
        🎙️
      </div>
      <div className="max-w-[92%] md:max-w-[88%] flex-1">
        {message.structured ? (
          <SchemeCard answer={message.structured} sources={message.sources || []} language={activeLanguage} />
        ) : (
          <div className="glass-strong rounded-2xl rounded-tl-sm px-5 py-3.5 text-sm text-bone/95 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md leading-relaxed whitespace-pre-wrap select-text">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}
