import { SourceRef } from "@/lib/types";

export default function SourceCard({ source }: { source: SourceRef }) {
  return (
    <div className="glass rounded-xl p-4 border border-white/10 hover:border-saffron/40 hover:-translate-y-1 hover:shadow-glow transition-all duration-300 relative overflow-hidden group bg-black/20">
      <div className="absolute inset-0 bg-gradient-to-r from-saffron/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>✓ Verified Official Resource</span>
          </div>
          <span className="text-[10px] text-mist/60 font-medium">Verified {source.last_updated}</span>
        </div>
        
        <div className="font-semibold text-sm mb-1 text-bone group-hover:text-saffron transition-colors">
          {source.title}
        </div>
        <div className="text-xs text-mist font-medium mb-2">{source.category}</div>
        
        <div className="text-[11px] text-mist/80 bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2">
          <span className="truncate">{source.source}</span>
        </div>

        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-saffron hover:text-white font-semibold group/link"
          >
            <span>Visit Official Government Portal</span>
            <span className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform">↗</span>
          </a>
        )}
      </div>
    </div>
  );
}
