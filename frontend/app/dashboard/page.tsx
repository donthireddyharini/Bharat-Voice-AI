"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import BrandLogo from "@/components/BrandLogo";
import { fetchConversations } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/useLanguage";
import { speak } from "@/lib/speech";
import { getSearchHistory, deleteSearchHistoryItem, clearSearchHistory, SearchHistoryEntry, HISTORY_UPDATED_EVENT } from "@/lib/history";
import { getChatSessions, deleteChatSession, clearAllChatSessions, ChatSession, CHAT_SESSIONS_UPDATED_EVENT } from "@/lib/chatSessions";

type DashboardTab = "overview" | "voice" | "schemes" | "history";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { language, t } = useLanguage();
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [speakingQuery, setSpeakingQuery] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations().then(setConversations).catch(() => {});
    setSearchHistory(getSearchHistory());
    setChatSessions(getChatSessions());

    const onHistoryUpdate = () => {
      setSearchHistory(getSearchHistory());
      setChatSessions(getChatSessions());
    };

    window.addEventListener(HISTORY_UPDATED_EVENT, onHistoryUpdate);
    window.addEventListener(CHAT_SESSIONS_UPDATED_EVENT, onHistoryUpdate);
    window.addEventListener("storage", onHistoryUpdate);
    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, onHistoryUpdate);
      window.removeEventListener(CHAT_SESSIONS_UPDATED_EVENT, onHistoryUpdate);
      window.removeEventListener("storage", onHistoryUpdate);
    };
  }, []);

  const handleQuickVoicePrompt = (text: string) => {
    setSpeakingQuery(text);
    speak(text, language, () => {
      setSpeakingQuery(null);
    });
  };

  const QUICK_SCHEMES = [
    {
      id: "pm-kisan",
      category: "Agriculture",
      icon: "🌾",
      title: language === "te" ? "పీఎం కిసాన్ సమ్మాన్ నిధి" : language === "hi" ? "पीएम किसान सम्मान निधि" : "PM-KISAN Samman Nidhi",
      desc: language === "te" ? "రైతులకు ఏటా ₹6,000 ప్రత్యక్ష ఆర్థిక సాయం" : language === "hi" ? "किसानों को प्रति वर्ष ₹6,000 की वित्तीय सहायता" : "₹6,000 annual direct income support for farmers",
      benefit: "₹6,000 / year",
    },
    {
      id: "ayushman-bharat",
      category: "Healthcare",
      icon: "🏥",
      title: language === "te" ? "ఆయుష్మాన్ భారత్ (PM-JAY)" : language === "hi" ? "आयुष्मान भारत (PM-JAY)" : "Ayushman Bharat PM-JAY",
      desc: language === "te" ? "కుటుంబానికి ఏడాదికి ₹5 లక్షల ఉచిత వైద్య చికిత్స" : language === "hi" ? "प्रति वर्ष ₹5 लाख तक का कैशलेस स्वास्थ्य बीमा" : "₹5 Lakh free annual cashless hospital treatment",
      benefit: "₹5,00,000 cover",
    },
    {
      id: "nmmss-scholarship",
      category: "Education",
      icon: "🎓",
      title: language === "te" ? "ఎన్‌ఎంఎంఎస్‌ఎస్ స్కాలర్‌షిప్" : language === "hi" ? "एनएमएमएसएस छात्रवृत्ति" : "NMMSS Merit Scholarship",
      desc: language === "te" ? "9వ తరగతి నుండి 12వ తరగతి వరకు విద్యార్థులకు ₹12,000" : language === "hi" ? "मेधावी छात्रों को ₹12,000 प्रति वर्ष की छात्रवृत्ति" : "₹12,000 per year for class 9-12 students",
      benefit: "₹12,000 / year",
    },
    {
      id: "pm-mudra",
      category: "Employment",
      icon: "💼",
      title: language === "te" ? "పీఎం ముద్రా యోజన" : language === "hi" ? "प्रधानमंत्री मुद्रा योजना" : "PM Mudra Loan Yojana",
      desc: language === "te" ? "చిన్న వ్యాపారాలకు ₹10 లక్షల వరకు పూచీకత్తు లేని రుణం" : language === "hi" ? "छोटे उद्यमों के लिए ₹10 लाख तक का कोलेटरल-फ्री लोन" : "Collateral-free business loans up to ₹10 Lakhs",
      benefit: "Up to ₹10 Lakh",
    },
    {
      id: "pm-awas",
      category: "Housing",
      icon: "🏠",
      title: language === "te" ? "పీఎం ఆవాస్ యోజన (PMAY)" : language === "hi" ? "प्रधानमंत्री आवास योजना" : "PM Awas Yojana (PMAY)",
      desc: language === "te" ? "పేద కుటుంబాలకు పక్కా ఇళ్ల నిర్మాణానికి సబ్సిడీ" : language === "hi" ? "पक्के मकान के निर्माण के लिए सरकारी वित्तीय सहायता" : "Housing financial subsidy for pucca home construction",
      benefit: "Subsidy up to ₹2.67L",
    },
    {
      id: "sukanya-samriddhi",
      category: "Women & Child",
      icon: "👧",
      title: language === "te" ? "సుకున్య సమృద్ధి యోజన" : language === "hi" ? "सुकन्या समृद्धि योजना" : "Sukanya Samriddhi Yojana",
      desc: language === "te" ? "బాలికల ఉన్నత చదువు మరియు వివాహానికి అధిక వడ్డీ పొదుపు" : language === "hi" ? "बालिकाओं की शिक्षा व विवाह हेतु उच्च ब्याज बचत योजना" : "High-interest savings scheme for girl child education",
      benefit: "8.2% Interest",
    },
  ];

  return (
    <div className="flex min-h-screen bg-transparent relative overflow-hidden text-bone">
      <Sidebar />
      
      <main className="flex-1 px-3 sm:px-8 py-4 sm:py-6 max-w-6xl mx-auto relative z-10 min-h-screen overflow-y-auto">
        
        {/* Top Header Bar: Logo on mobile, Title, Language Switcher, Home & Sign Out */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10 flex-wrap relative z-30">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="md:hidden block shrink-0">
              <BrandLogo size="sm" showText={false} />
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-bone flex items-center gap-2">
                <span>{t.dashTitle}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-saffron/20 text-saffron border border-saffron/30">
                  {t.langNative}
                </span>
              </h1>
              <p className="text-mist text-xs">{t.dashSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              href="/"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full glass border border-white/15 text-xs font-semibold text-bone hover:border-saffron/40 hover:bg-white/5 active:scale-95 transition-all shadow-sm"
            >
              <span>🏠</span>
              <span className="hidden sm:inline">{t.navHome}</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full glass border border-red-500/20 text-xs font-semibold text-red-200 hover:bg-red-500/10 hover:border-red-500/40 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">{t.navSignOut}</span>
            </button>
          </div>
        </div>

        {/* NEATLY ARRANGED TABS BAR */}
        <div className="flex items-center gap-2 mb-6 p-1.5 glass-strong rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-saffron to-gulal text-white shadow-glow"
                : "text-mist hover:text-bone hover:bg-white/5"
            }`}
          >
            <span>📊</span>
            <span>{t.dashTabOverview}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("voice")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === "voice"
                ? "bg-gradient-to-r from-amethyst to-cyber text-white shadow-glowNeon"
                : "text-mist hover:text-bone hover:bg-white/5"
            }`}
          >
            <span>🎙️</span>
            <span>{t.dashTabVoice}</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">1-Tap</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("schemes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === "schemes"
                ? "bg-gradient-to-r from-cyber/80 to-neon text-gray-900 shadow-glowCyan font-bold"
                : "text-mist hover:text-bone hover:bg-white/5"
            }`}
          >
            <span>🏛️</span>
            <span>{t.dashTabSchemes}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === "history"
                ? "bg-gradient-to-r from-saffron/80 to-amethyst text-white shadow-masterpiece"
                : "text-mist hover:text-bone hover:bg-white/5"
            }`}
          >
            <span>💬</span>
            <span>{t.dashTabHistory}</span>
            {(chatSessions.length > 0 || searchHistory.length > 0 || conversations.length > 0) && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">
                {chatSessions.length + searchHistory.length || conversations.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Action Hub Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href={`/assistant?lang=${language}`}
                className="glass-strong rounded-2xl p-6 border border-white/10 hover:border-saffron/50 transition-all duration-300 group active:scale-[0.98] hover:shadow-masterpiece relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-saffron/15 via-gulal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-saffron/15 text-saffron flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-glow">
                    🎙️
                  </div>
                  <h3 className="font-display font-bold text-lg text-bone mb-1">{t.dashLiveAssistantTitle}</h3>
                  <p className="text-xs text-mist/85 leading-relaxed mb-4">
                    {t.dashLiveAssistantDesc}
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-saffron group-hover:translate-x-1 transition-transform">
                    <span>{t.dashStartTalking}</span>
                  </div>
                </div>
              </Link>

              <Link
                href="/profile"
                className="glass-strong rounded-2xl p-6 border border-white/10 hover:border-amethyst/50 transition-all duration-300 group active:scale-[0.98] hover:shadow-masterpiece relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amethyst/15 via-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-amethyst/15 text-amethyst flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-glowPurple">
                    👤
                  </div>
                  <h3 className="font-display font-bold text-lg text-bone mb-1">{t.dashProfileTitle}</h3>
                  <p className="text-xs text-mist/85 leading-relaxed mb-4">
                    {t.dashProfileDesc}
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-amethyst group-hover:translate-x-1 transition-transform">
                    <span>{t.dashManageProfile}</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Featured Welfare Schemes Row */}
            <div className="glass-strong rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-base text-bone flex items-center gap-2">
                  <span>🏛️</span>
                  <span>{t.dashSchemesTitle}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("schemes")}
                  className="text-xs text-saffron hover:underline font-semibold"
                >
                  {t.dashExploreSchemes}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {QUICK_SCHEMES.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="glass p-4 rounded-xl border border-white/10 hover:border-saffron/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xl mb-1.5">{s.icon}</div>
                      <h4 className="font-bold text-sm text-bone mb-1">{s.title}</h4>
                      <p className="text-[11px] text-mist/80 mb-3">{s.desc}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] text-cyber font-bold">{s.benefit}</span>
                      <Link
                        href={`/assistant?lang=${language}&category=${s.category.toLowerCase()}`}
                        className="text-xs text-saffron hover:underline font-medium"
                      >
                        Ask →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Searches Activity */}
            {searchHistory.length > 0 && (
              <div className="glass-strong rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-base text-bone flex items-center gap-2">
                    <span>🕒</span>
                    <span>Recent Searches with Timestamps</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("history")}
                    className="text-xs text-saffron hover:underline font-semibold"
                  >
                    View All ({searchHistory.length}) →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {searchHistory.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="glass p-3.5 rounded-xl border border-white/5 hover:border-saffron/30 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-cyber font-semibold">
                            📅 {item.formattedDate}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-mist">
                            {item.viaVoice ? "🎙️ Voice" : "🔍 Search"}
                          </span>
                        </div>
                        <Link
                          href={`/assistant?q=${encodeURIComponent(item.query)}&lang=${item.language}`}
                          className="text-xs font-semibold text-bone hover:text-saffron truncate block"
                        >
                          "{item.query}"
                        </Link>
                      </div>

                      <Link
                        href={`/assistant?q=${encodeURIComponent(item.query)}&lang=${item.language}`}
                        className="text-xs text-saffron hover:text-gulal font-bold whitespace-nowrap"
                      >
                        Ask Again →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VOICE QUERIES (1-Tap Voice Hub) */}
        {activeTab === "voice" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-strong rounded-2xl p-6 border border-white/10 relative overflow-hidden">
              <div className="max-w-2xl mb-6">
                <h3 className="font-display font-bold text-lg text-bone mb-2 flex items-center gap-2">
                  <span>🎙️</span>
                  <span>One-Tap Voice Intelligence</span>
                </h3>
                <p className="text-xs text-mist leading-relaxed">
                  Tap any prompt below to hear high-definition natural voice playback in {t.langNative}, or launch the live voice assistant to speak directly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { icon: "🎓", label: "Scholarships", query: t.promptScholarship },
                  { icon: "🌾", label: "Agriculture", query: t.promptKisan },
                  { icon: "🏥", label: "Healthcare", query: t.promptAyushman },
                  { icon: "💼", label: "Jobs & Loans", query: t.promptJobs },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="glass p-4 rounded-xl border border-white/10 hover:border-amethyst/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-[10px] uppercase font-bold text-cyber px-2 py-0.5 rounded-full bg-cyber/10 border border-cyber/20">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-bone mb-4 leading-relaxed">
                        "{item.query}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => handleQuickVoicePrompt(item.query)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          speakingQuery === item.query
                            ? "bg-saffron text-white shadow-glow"
                            : "glass hover:bg-white/10 text-bone border border-white/10"
                        }`}
                      >
                        <span>🔊</span>
                        <span>{speakingQuery === item.query ? "Speaking..." : "Listen"}</span>
                      </button>

                      <Link
                        href={`/assistant?lang=${language}&category=${item.label.toLowerCase()}`}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-saffron to-gulal text-white text-xs font-bold hover:scale-105 active:scale-95 transition-all"
                      >
                        Ask Assistant →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SCHEMES DIRECTORY */}
        {activeTab === "schemes" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {QUICK_SCHEMES.map((scheme) => (
                <div
                  key={scheme.id}
                  className="glass-strong rounded-2xl p-5 border border-white/10 hover:border-saffron/40 transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-masterpiece"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{scheme.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-saffron bg-saffron/10 px-2.5 py-0.5 rounded-full border border-saffron/20">
                        {scheme.category}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-base text-bone mb-2">
                      {scheme.title}
                    </h4>
                    <p className="text-xs text-mist/85 leading-relaxed mb-4">
                      {scheme.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-mist/60 uppercase">Benefit</div>
                      <div className="text-xs font-extrabold text-cyber">{scheme.benefit}</div>
                    </div>
                    <Link
                      href={`/assistant?lang=${language}&category=${scheme.category.toLowerCase()}`}
                      className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-saffron via-gulal to-amethyst text-white text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all"
                    >
                      Check Eligibility →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RECENT SEARCH & VOICE HISTORY */}
        {activeTab === "history" && (
          <div className="glass-strong rounded-2xl p-6 border border-white/10 animate-fadeIn space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-base text-bone flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-saffron shadow-glow" />
                  <span>Conversations &amp; Search History</span>
                </h3>
                <p className="text-xs text-mist mt-0.5">
                  Complete conversations and queries saved chronologically with dates, timestamps, and full scheme responses.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(chatSessions.length > 0 || searchHistory.length > 0) && (
                  <>
                    <span className="text-xs font-semibold text-cyber glass px-2.5 py-1 rounded-lg border border-cyber/20">
                      {chatSessions.length} chats · {searchHistory.length} searches
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear all saved conversations and search history?")) {
                          clearAllChatSessions();
                          clearSearchHistory();
                        }
                      }}
                      className="text-xs text-red-300 hover:text-red-200 px-3 py-1 rounded-lg glass border border-red-500/20 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                      Clear All
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* SECTION 1: FULL SAVED CHAT SESSIONS */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-sm text-bone flex items-center gap-2">
                <span>💬</span>
                <span>Saved Full Conversations ({chatSessions.length})</span>
              </h4>

              {chatSessions.length === 0 ? (
                <div className="p-4 rounded-xl glass border border-white/5 text-center text-xs text-mist/70">
                  No full chat sessions saved yet. Start talking with the Voice Assistant to save conversations automatically.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className="glass-strong rounded-xl p-4 border border-white/10 hover:border-saffron/40 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-mist/70 mb-2">
                          <span className="flex items-center gap-1 font-mono text-cyber font-semibold text-[11px] bg-cyber/10 border border-cyber/25 px-2.5 py-0.5 rounded-full">
                            <span>📅</span>
                            <span>{session.formattedDate}</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-bone">
                              {session.messages.length} messages
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteChatSession(session.id)}
                              className="text-mist/40 hover:text-red-400 text-xs px-1"
                              title="Delete conversation"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <h5 className="font-semibold text-sm text-bone group-hover:text-saffron transition-colors line-clamp-2 mb-2">
                          {session.title || "Voice Assistant Conversation"}
                        </h5>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-mist/70 uppercase tracking-wider font-semibold">
                          🌐 {session.language.toUpperCase()}
                        </span>
                        <Link
                          href={`/assistant?session=${session.id}&lang=${session.language}`}
                          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-saffron to-gulal text-white text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                        >
                          <span>Open Full Chat 💬</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: SEARCH QUERIES */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h4 className="font-display font-bold text-sm text-bone flex items-center gap-2">
                <span>🔍</span>
                <span>Recent Queries ({searchHistory.length})</span>
              </h4>

              {searchHistory.length === 0 ? (
                <div className="p-4 rounded-xl glass border border-white/5 text-center text-xs text-mist/70">
                  No individual search queries recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {searchHistory.map((item) => (
                    <div
                      key={item.id}
                      className="glass-strong rounded-xl p-4 border border-white/10 hover:border-saffron/30 transition-all group flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-xs text-mist/70 mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 font-mono text-cyber font-semibold text-[11px] bg-cyber/10 border border-cyber/25 px-2.5 py-0.5 rounded-full">
                            <span>📅</span>
                            <span>{item.formattedDate}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-bone">
                            {item.viaVoice ? "🎙️ Voice Query" : "🔍 Search Query"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-saffron/10 border border-saffron/20 text-[10px] uppercase font-bold text-saffron">
                            {item.language.toUpperCase()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteSearchHistoryItem(item.id)}
                          className="text-mist/40 hover:text-red-400 text-sm px-2 py-0.5 rounded hover:bg-white/5 transition-all"
                          title="Delete from history"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="mb-2">
                        <Link
                          href={`/assistant?q=${encodeURIComponent(item.query)}&lang=${item.language}`}
                          className="font-semibold text-sm sm:text-base text-bone group-hover:text-saffron transition-colors block cursor-pointer"
                        >
                          "{item.query}"
                        </Link>
                        {item.answerSummary && (
                          <p className="text-xs text-mist/80 mt-1 line-clamp-2 leading-relaxed">
                            {item.answerSummary}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          {item.category && (
                            <span className="text-[10px] text-amethyst font-semibold uppercase tracking-wider bg-amethyst/10 px-2 py-0.5 rounded border border-amethyst/20">
                              🏷️ {item.category}
                            </span>
                          )}
                          {item.sourcesCount && item.sourcesCount > 0 ? (
                            <span className="text-[10px] text-mist/70">
                              📚 {item.sourcesCount} verified sources
                            </span>
                          ) : null}
                        </div>

                        <Link
                          href={`/assistant?q=${encodeURIComponent(item.query)}&lang=${item.language}`}
                          className="text-xs font-bold text-saffron hover:text-gulal flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>Ask Assistant Again</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
