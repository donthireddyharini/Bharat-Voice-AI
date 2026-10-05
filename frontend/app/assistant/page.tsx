"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import LanguageSelector from "@/components/LanguageSelector";
import SourceCard from "@/components/SourceCard";
import DocumentUploader from "@/components/DocumentUploader";
import EligibilityFlow from "@/components/EligibilityFlow";
import BrandLogo from "@/components/BrandLogo";
import { Language, SourceRef } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/useLanguage";
import { getSearchHistory, deleteSearchHistoryItem, clearSearchHistory, SearchHistoryEntry, HISTORY_UPDATED_EVENT } from "@/lib/history";

const LANGUAGE_ONBOARDING_KEY = "bharathvoice_onboarded";

function AssistantContent() {
  const { logout } = useAuth();
  const searchParams = useSearchParams();
  const { language, setLanguage, t } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sources, setSources] = useState<SourceRef[]>([]);
  const [followups, setFollowups] = useState<string[]>([]);
  const [rightTab, setRightTab] = useState<"sources" | "documents" | "guide" | "history">("sources");
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [mobileTab, setMobileTab] = useState<"chat" | "tools">("chat");
  const [externalQuery, setExternalQuery] = useState<{ text: string; nonce: number } | null>(null);
  const [showMoreOnboardingLangs, setShowMoreOnboardingLangs] = useState(false);

  useEffect(() => {
    setHistory(getSearchHistory());
    const onHistoryUpdate = () => setHistory(getSearchHistory());
    window.addEventListener(HISTORY_UPDATED_EVENT, onHistoryUpdate);
    window.addEventListener("storage", onHistoryUpdate);
    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, onHistoryUpdate);
      window.removeEventListener("storage", onHistoryUpdate);
    };
  }, []);

  useEffect(() => {
    const onboarded = localStorage.getItem(LANGUAGE_ONBOARDING_KEY);
    if (!onboarded) setShowOnboarding(true);

    const lang = searchParams.get("lang") as Language;
    if (lang && ["en", "hi", "te", "kn", "ta", "mr", "bn", "gu", "ml", "pa", "or"].includes(lang)) {
      setLanguage(lang);
      setShowOnboarding(false);
    }

    const q = searchParams.get("q") || searchParams.get("query");
    if (q) {
      setExternalQuery({ text: q, nonce: Date.now() });
    } else {
      const category = searchParams.get("category");
      if (category) {
        setExternalQuery({ text: `Tell me about ${category.replace("_", " ")} related services.`, nonce: Date.now() });
      }
    }
  }, [searchParams]);

  function completeOnboarding(lang: Language) {
    setLanguage(lang);
    localStorage.setItem(LANGUAGE_ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-transparent text-bone">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-amethyst/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-saffron/10 rounded-full blur-[100px]" />
      </div>

      {/* Sidebar — direct flex child so it doesn't overlap main content */}
      <Sidebar />

      <div className="flex-1 grid lg:grid-cols-[1fr_320px] min-h-screen relative z-10">
        <main className="px-3 sm:px-6 py-4 sm:py-6 flex flex-col min-h-screen relative">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2.5 relative z-40">
            <div className="flex items-center gap-2.5">
              <Link href="/" className="md:hidden block shrink-0">
                <BrandLogo size="sm" showText={false} />
              </Link>
              <h1 className="font-display text-lg sm:text-2xl font-bold bg-gradient-to-r from-bone to-mist bg-clip-text text-transparent drop-shadow-sm truncate">
                Voice Assistant
              </h1>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="glass px-1.5 py-0.5 rounded-full border border-white/10 shadow-inner-light">
                <LanguageSelector value={language} onChange={setLanguage} compact />
              </div>
              <Link
                href="/"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full glass border border-white/15 text-xs font-semibold text-bone hover:border-saffron/40 hover:bg-white/5 active:scale-95 transition-all shadow-sm"
              >
                <span>🏠</span>
                <span className="hidden sm:inline">Home</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full glass border border-red-500/20 text-xs font-semibold text-red-200 hover:bg-red-500/10 hover:border-red-500/40 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Mobile Switcher (Chat vs Tools) */}
          <div className="flex lg:hidden gap-1 p-1 glass rounded-2xl mb-3 border border-white/10">
            <button
              onClick={() => setMobileTab("chat")}
              className={`flex-1 text-xs py-2 rounded-xl font-bold transition-all duration-300 ${
                mobileTab === "chat"
                  ? "bg-gradient-to-r from-saffron to-gulal text-white shadow-glow"
                  : "text-mist hover:text-bone"
              }`}
            >
              💬 Chat Assistant
            </button>
            <button
              onClick={() => setMobileTab("tools")}
              className={`flex-1 text-xs py-2 rounded-xl font-bold transition-all duration-300 ${
                mobileTab === "tools"
                  ? "bg-gradient-to-r from-amethyst to-cyber text-white shadow-glow"
                  : "text-mist hover:text-bone"
              }`}
            >
              📚 Tools &amp; Sources {sources.length > 0 && `(${sources.length})`}
            </button>
          </div>

          {/* Main Card (Chat or Mobile Tools) */}
          {mobileTab === "chat" ? (
            <div className="flex-1 glass-strong rounded-2xl sm:rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-3 sm:p-5 h-[calc(100dvh-150px)] sm:min-h-[70vh] relative overflow-hidden group">
              <div className="absolute inset-0 rounded-2xl sm:rounded-[2rem] border border-transparent group-hover:border-saffron/20 transition-colors duration-700 pointer-events-none" />
              <ChatWindow
                language={language}
                externalQuery={externalQuery}
                onSourcesChange={setSources}
                onFollowupsChange={setFollowups}
              />
            </div>
          ) : (
            <div className="lg:hidden flex-1 glass-strong rounded-2xl border border-white/10 p-4 space-y-4 overflow-y-auto">
              <div className="flex gap-1 p-1 glass rounded-xl border border-white/10 overflow-x-auto">
                {(["sources", "documents", "guide", "history"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRightTab(tab)}
                    className={`flex-1 text-xs py-2 px-2 rounded-lg font-semibold capitalize whitespace-nowrap transition-all ${
                      rightTab === tab
                        ? "bg-saffron/20 text-saffron border border-saffron/40"
                        : "text-mist hover:text-bone"
                    }`}
                  >
                    {tab === "history" ? `History (${history.length})` : tab}
                  </button>
                ))}
              </div>

              {rightTab === "sources" && (
                <div className="space-y-3">
                  <h3 className="font-display font-semibold text-xs text-mist">Verified Sources</h3>
                  {sources.length === 0 ? (
                    <p className="text-xs text-mist/60 glass p-4 rounded-xl text-center">Ask a question to view verified government sources.</p>
                  ) : (
                    sources.map((s) => <SourceCard key={s.doc_id} source={s} />)
                  )}
                </div>
              )}

              {rightTab === "documents" && <DocumentUploader />}
              {rightTab === "guide" && (
                <EligibilityFlow onComplete={(query) => {
                  setExternalQuery({ text: query, nonce: Date.now() });
                  setMobileTab("chat");
                }} />
              )}

              {rightTab === "history" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-xs text-mist">
                      Search History ({history.length})
                    </h3>
                    {history.length > 0 && (
                      <button
                        type="button"
                        onClick={() => clearSearchHistory()}
                        className="text-[10px] text-red-300 hover:text-red-200 px-2 py-0.5 rounded glass border border-red-500/20"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {history.length === 0 ? (
                    <p className="text-xs text-mist/60 glass p-4 rounded-xl text-center">
                      No searches recorded yet. Search or ask a voice query to build history.
                    </p>
                  ) : (
                    history.map((item) => (
                      <div key={item.id} className="glass p-3 rounded-xl border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-mist/60">
                          <span className="font-mono text-cyber/90">📅 {item.formattedDate}</span>
                          <button
                            type="button"
                            onClick={() => deleteSearchHistoryItem(item.id)}
                            className="text-red-400 text-xs px-1"
                          >
                            ✕
                          </button>
                        </div>
                        <p
                          onClick={() => {
                            setExternalQuery({ text: item.query, nonce: Date.now() });
                            setMobileTab("chat");
                          }}
                          className="text-xs font-semibold text-bone hover:text-saffron cursor-pointer"
                        >
                          "{item.query}"
                        </p>
                        {item.answerSummary && (
                          <p className="text-[11px] text-mist/70 line-clamp-2">{item.answerSummary}</p>
                        )}
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setExternalQuery({ text: item.query, nonce: Date.now() });
                              setMobileTab("chat");
                            }}
                            className="text-[10px] text-cyber font-semibold"
                          >
                            Ask Again →
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Desktop Right Panel */}
        <aside className="hidden lg:flex flex-col gap-5 border-l border-white/5 px-5 py-6 bg-void/40 backdrop-blur-md">
          <div className="flex gap-1.5 p-1 glass rounded-xl border border-white/5 overflow-x-auto">
            {(["sources", "documents", "guide", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`flex-1 text-xs px-2.5 py-2 rounded-lg font-medium capitalize whitespace-nowrap transition-all duration-300 ${
                  rightTab === tab 
                    ? "bg-saffron/15 text-saffron border border-saffron/30 shadow-[0_0_15px_rgba(255,153,51,0.15)]" 
                    : "border border-transparent text-mist hover:text-bone hover:bg-white/5"
                }`}
              >
                {tab === "history" ? `History (${history.length})` : tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {rightTab === "sources" && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-display font-semibold text-sm text-mist flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-amethyst" />
                  Source References
                </h3>
                {sources.length === 0 ? (
                  <div className="glass p-4 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center gap-2 min-h-[120px]">
                    <span className="text-2xl opacity-50">📚</span>
                    <p className="text-sm text-mist/60">Ask a question to see the trusted sources behind the answer here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sources.map((s) => <SourceCard key={s.doc_id} source={s} />)}
                  </div>
                )}
                
                {followups.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-white/5">
                    <h3 className="font-display font-semibold text-sm text-mist mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 rounded-full bg-saffron" />
                      Suggested Follow-ups
                    </h3>
                    <div className="flex flex-col gap-2">
                      {followups.map((f) => (
                        <button
                          key={f}
                          onClick={() => setExternalQuery({ text: f, nonce: Date.now() })}
                          className="text-left text-xs glass-strong rounded-xl px-4 py-3 border border-white/10 hover:border-saffron/40 hover:shadow-[0_0_15px_rgba(255,153,51,0.1)] transition-all group"
                        >
                          <span className="text-mist group-hover:text-bone transition-colors">{f}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {rightTab === "documents" && (
              <div className="animate-fade-in">
                <DocumentUploader />
              </div>
            )}

            {rightTab === "guide" && (
              <div className="animate-fade-in">
                <EligibilityFlow onComplete={(query) => setExternalQuery({ text: query, nonce: Date.now() })} />
              </div>
            )}

            {rightTab === "history" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-sm text-mist flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-saffron" />
                    Search History ({history.length})
                  </h3>
                  {history.length > 0 && (
                    <button
                      type="button"
                      onClick={() => clearSearchHistory()}
                      className="text-[10px] text-red-300 hover:text-red-200 transition-colors px-2 py-0.5 rounded-lg glass border border-red-500/20"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="glass p-4 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center gap-2 min-h-[140px]">
                    <span className="text-2xl opacity-50">🕒</span>
                    <p className="text-xs text-mist/60">Your recent searches will appear here with dates and times.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="glass-strong rounded-xl p-3 border border-white/10 hover:border-saffron/30 transition-all group relative"
                      >
                        <div className="flex items-center justify-between text-[10px] text-mist/60 mb-1.5">
                          <span className="flex items-center gap-1 font-mono text-cyber/90">
                            📅 {item.formattedDate}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 uppercase text-[9px]">
                              {item.viaVoice ? "🎙️ Voice" : "🔍 Search"}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSearchHistoryItem(item.id);
                              }}
                              className="text-mist/40 hover:text-red-400 text-xs px-1"
                              title="Delete from history"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <p
                          onClick={() => setExternalQuery({ text: item.query, nonce: Date.now() })}
                          className="text-xs font-semibold text-bone hover:text-saffron cursor-pointer transition-colors leading-relaxed line-clamp-2"
                        >
                          "{item.query}"
                        </p>

                        {item.answerSummary && (
                          <p className="text-[11px] text-mist/70 mt-1 line-clamp-2 leading-relaxed">
                            {item.answerSummary}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5">
                          <span className="text-[9px] text-saffron uppercase font-bold tracking-wider">
                            {item.category || "Scheme Info"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setExternalQuery({ text: item.query, nonce: Date.now() })}
                            className="text-[10px] text-cyber hover:underline font-semibold"
                          >
                            Ask Again →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Language Onboarding Modal (Responsive) */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[100] bg-void/85 backdrop-blur-xl flex items-center justify-center p-4 transition-all duration-500">
          <div className="glass-neon rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center border border-saffron/30 shadow-[0_0_50px_rgba(255,122,61,0.2)] animate-scaleIn">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-saffron via-gulal to-amethyst animate-spinSlow opacity-70 blur-md" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-saffron via-gulal to-amethyst border-2 border-void flex items-center justify-center shadow-glow">
                <span className="text-xl text-void font-bold">🗣️</span>
              </div>
            </div>
            
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-2 text-bone">Choose Your Native Language</h2>
            <p className="text-xs sm:text-sm text-mist/90 mb-5 font-medium leading-relaxed">
              BharathVoice AI speaks, listens and understands your intention in 11 Indian languages. Pick your language to get started with voice assistance:
            </p>
            
            {/* Primary Languages */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-3">
              {(["en", "hi", "te", "kn"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => completeOnboarding(lang)}
                  className="glass-strong rounded-xl sm:rounded-2xl py-3 sm:py-3.5 px-3 text-xs sm:text-sm font-semibold border border-white/10 hover:border-saffron hover:bg-saffron/10 hover:shadow-[0_0_20px_rgba(255,122,61,0.2)] active:scale-95 transition-all duration-300"
                >
                  {{ en: "English", hi: "हिन्दी", te: "తెలుగు", kn: "ಕನ್ನಡ" }[lang]}
                </button>
              ))}
            </div>

            {/* Toggle More Languages Button */}
            {!showMoreOnboardingLangs ? (
              <button
                type="button"
                onClick={() => setShowMoreOnboardingLangs(true)}
                className="w-full py-2.5 px-4 rounded-xl glass border border-white/15 text-xs text-mist hover:text-bone hover:border-amethyst/50 transition-all flex items-center justify-center gap-2"
              >
                <span>+ More Indian Languages (Tamil, Marathi, Bengali...)</span>
                <span className="text-[10px]">▼</span>
              </button>
            ) : (
              <div className="space-y-2 pt-2 border-t border-white/10 animate-fadeIn">
                <div className="text-[11px] font-semibold text-mist text-left">Additional Regional Languages:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                  {[
                    { code: "ta" as Language, name: "தமிழ் (Tamil)" },
                    { code: "mr" as Language, name: "मराठी (Marathi)" },
                    { code: "bn" as Language, name: "বাংলা (Bengali)" },
                    { code: "gu" as Language, name: "ગુજરાતી (Gujarati)" },
                    { code: "ml" as Language, name: "മലയാളം (Malayalam)" },
                    { code: "pa" as Language, name: "ਪੰਜਾਬੀ (Punjabi)" },
                    { code: "or" as Language, name: "ଓଡ଼ିଆ (Odia)" },
                  ].map((extra) => (
                    <button
                      key={extra.code}
                      type="button"
                      onClick={() => completeOnboarding(extra.code)}
                      className="glass rounded-xl py-2 px-2 text-[11px] font-medium border border-white/10 hover:border-amethyst hover:bg-amethyst/15 hover:text-bone transition-all text-left"
                    >
                      {extra.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-void text-bone flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-saffron border-t-transparent animate-spin" />
            <p className="text-xs sm:text-sm font-medium text-mist">Loading BharathVoice Assistant...</p>
          </div>
        </div>
      }
    >
      <AssistantContent />
    </Suspense>
  );
}
