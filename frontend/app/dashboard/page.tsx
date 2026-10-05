"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import BrandLogo from "@/components/BrandLogo";
import DashboardLanguageSelector from "@/components/DashboardLanguageSelector";
import { fetchConversations } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/useLanguage";
import { speak } from "@/lib/speech";
import { getSearchHistory, deleteSearchHistoryItem, clearSearchHistory, SearchHistoryEntry, HISTORY_UPDATED_EVENT } from "@/lib/history";
import { getChatSessions, deleteChatSession, clearAllChatSessions, ChatSession, CHAT_SESSIONS_UPDATED_EVENT } from "@/lib/chatSessions";

type DashboardTab = "overview" | "voice" | "schemes" | "history";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
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
      category: language === "te" ? "వ్యవసాయం" : language === "hi" ? "कृषि" : "Agriculture",
      icon: "🌾",
      title: language === "te" ? "పీఎం కిసాన్ సమ్మాన్ నిధి" : language === "hi" ? "पीएम किसान सम्मान निधि" : "PM-KISAN Samman Nidhi",
      desc: language === "te" ? "రైతులకు ఏటా ₹6,000 ప్రత్యక్ష ఆర్థిక సాయం" : language === "hi" ? "किसानों को प्रति वर्ष ₹6,000 की वित्तीय सहायता" : "₹6,000 annual direct income support for farmers",
      benefit: "₹6,000 / year",
    },
    {
      id: "ayushman-bharat",
      category: language === "te" ? "వైద్యం" : language === "hi" ? "स्वास्थ्य" : "Healthcare",
      icon: "🏥",
      title: language === "te" ? "ఆయుష్మాన్ భారత్ (PM-JAY)" : language === "hi" ? "आयुष्मान भारत (PM-JAY)" : "Ayushman Bharat PM-JAY",
      desc: language === "te" ? "కుటుంబానికి ఏడాదికి ₹5 లక్షల ఉచిత వైద్య చికిత్స" : language === "hi" ? "प्रति वर्ष ₹5 लाख तक का कैशलेस स्वास्थ्य बीमा" : "₹5 Lakh free annual cashless hospital treatment",
      benefit: "₹5,00,000 cover",
    },
    {
      id: "nmmss-scholarship",
      category: language === "te" ? "విద్య" : language === "hi" ? "शिक्षा" : "Education",
      icon: "🎓",
      title: language === "te" ? "ఎన్‌ఎంఎంఎస్‌ఎస్ స్కాలర్‌షిప్" : language === "hi" ? "एनएमएमएसएस छात्रवृत्ति" : "NMMSS Merit Scholarship",
      desc: language === "te" ? "9వ తరగతి నుండి 12వ తరగతి వరకు విద్యార్థులకు ₹12,000" : language === "hi" ? "मेधावी छात्रों को ₹12,000 प्रति वर्ष की छात्रवृत्ति" : "₹12,000 per year for class 9-12 students",
      benefit: "₹12,000 / year",
    },
    {
      id: "pm-mudra",
      category: language === "te" ? "ఉపాధి" : language === "hi" ? "रोजगार" : "Employment",
      icon: "💼",
      title: language === "te" ? "పీఎం ముద్రా యోజన" : language === "hi" ? "प्रधानमंत्री मुद्रा योजना" : "PM Mudra Loan Yojana",
      desc: language === "te" ? "చిన్న వ్యాపారాలకు ₹10 లక్షల వరకు పూచీకత్తు లేని రుణం" : language === "hi" ? "छोटे उद्यमों के लिए ₹10 लाख तक का कोलेटरल-फ्री लोन" : "Collateral-free business loans up to ₹10 Lakhs",
      benefit: "Up to ₹10 Lakh",
    },
    {
      id: "pm-awas",
      category: language === "te" ? "గృహనిర్మాణం" : language === "hi" ? "आवास" : "Housing",
      icon: "🏠",
      title: language === "te" ? "పీఎం ఆవాస్ యోజన (PMAY)" : language === "hi" ? "प्रधानमंत्री आवास योजना" : "PM Awas Yojana (PMAY)",
      desc: language === "te" ? "పేద కుటుంబాలకు పక్కా ఇళ్ల నిర్మాణానికి సబ్సిడీ" : language === "hi" ? "पक्के मकान के निर्माण के लिए सरकारी वित्तीय सहायता" : "Housing financial subsidy for pucca home construction",
      benefit: "Subsidy up to ₹2.67L",
    },
    {
      id: "sukanya-samriddhi",
      category: language === "te" ? "మహిళ & శిశు సంక్షేమం" : language === "hi" ? "महिला व बाल विकास" : "Women & Child",
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
        
        {/* Top Header Bar: Logo on mobile, Title, Interactive Language Switcher, Home & Sign Out */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10 flex-wrap relative z-30">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="md:hidden block shrink-0">
              <BrandLogo size="sm" showText={false} />
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-bone flex items-center gap-2.5 flex-wrap">
                <span>{t.dashTitle}</span>
                {/* Interactive Language Selector directly on dashboard */}
                <DashboardLanguageSelector value={language} onChange={setLanguage} />
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
            {chatSessions.length > 0 && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">
                {chatSessions.length}
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
                        {language === "te" ? "అడగండి →" : language === "hi" ? "पूछें →" : "Ask →"}
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
                    <span>
                      {language === "te"
                        ? "ఇటీవలి శోధనలు"
                        : language === "hi"
                        ? "हाल की खोजें"
                        : "Recent Searches with Timestamps"}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("history")}
                    className="text-xs text-saffron hover:underline font-semibold"
                  >
                    {language === "te"
                      ? `అన్నీ చూడండి (${searchHistory.length}) →`
                      : language === "hi"
                      ? `सभी देखें (${searchHistory.length}) →`
                      : `View All (${searchHistory.length}) →`}
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
                        {language === "te" ? "మళ్లీ అడగండి →" : language === "hi" ? "फिर से पूछें →" : "Ask Again →"}
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
                  <span>
                    {language === "te"
                      ? "వన్-ట్యాప్ వాయిస్ సమాధానాలు"
                      : language === "hi"
                      ? "वन-टैप वॉइस इंटेलिजेंस"
                      : "One-Tap Voice Intelligence"}
                  </span>
                </h3>
                <p className="text-xs text-mist leading-relaxed">
                  {language === "te"
                    ? `సహజమైన వాయిస్ వినడానికి క్రింది ప్రశ్నలపై నొక్కండి, లేదా మాట్లాడటానికి అసిస్టెంట్‌ని తెరవండి.`
                    : language === "hi"
                    ? `प्राकृतिक आवाज में सुनने के लिए नीचे दिए गए प्रश्नों पर टैप करें।`
                    : `Tap any prompt below to hear high-definition natural voice playback in ${t.langNative}, or launch the live voice assistant to speak directly.`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    icon: "🎓",
                    label: language === "te" ? "స్కాలర్‌షిప్‌లు" : language === "hi" ? "छात्रवृत्तियां" : "Scholarships",
                    query: t.promptScholarship,
                  },
                  {
                    icon: "🌾",
                    label: language === "te" ? "వ్యవసాయం" : language === "hi" ? "कृषि" : "Agriculture",
                    query: t.promptKisan,
                  },
                  {
                    icon: "🏥",
                    label: language === "te" ? "వైద్యం" : language === "hi" ? "स्वास्थ्य" : "Healthcare",
                    query: t.promptAyushman,
                  },
                  {
                    icon: "💼",
                    label: language === "te" ? "ఉద్యోగాలు & రుణాలు" : language === "hi" ? "रोजगार व लोन" : "Jobs & Loans",
                    query: t.promptJobs,
                  },
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
                        <span>
                          {speakingQuery === item.query
                            ? language === "te"
                              ? "మాట్లాడుతోంది..."
                              : language === "hi"
                              ? "बोल रहा है..."
                              : "Speaking..."
                            : language === "te"
                            ? "వినండి"
                            : language === "hi"
                            ? "सुनें"
                            : "Listen"}
                        </span>
                      </button>

                      <Link
                        href={`/assistant?lang=${language}`}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-saffron to-gulal text-white text-xs font-bold hover:scale-105 active:scale-95 transition-all"
                      >
                        {language === "te"
                          ? "అసిస్టెంట్‌ను అడగండి →"
                          : language === "hi"
                          ? "सहायक से पूछें →"
                          : "Ask Assistant →"}
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
                      <div className="text-[10px] text-mist/60 uppercase">
                        {language === "te" ? "ప్రయోజనం" : language === "hi" ? "लाभ" : "Benefit"}
                      </div>
                      <div className="text-xs font-extrabold text-cyber">{scheme.benefit}</div>
                    </div>
                    <Link
                      href={`/assistant?lang=${language}`}
                      className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-saffron via-gulal to-amethyst text-white text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all"
                    >
                      {language === "te"
                        ? "అర్హత చూడండి →"
                        : language === "hi"
                        ? "पात्रता जांचें →"
                        : "Check Eligibility →"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SAVED CONVERSATIONS */}
        {activeTab === "history" && (
          <div className="glass-strong rounded-2xl p-6 border border-white/10 animate-fadeIn space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-base text-bone flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-saffron shadow-glow" />
                  <span>
                    {language === "te"
                      ? "సేవ్ చేసిన సంభాషణలు"
                      : language === "hi"
                      ? "सुरक्षित बातचीत"
                      : "Saved Conversations"}
                  </span>
                </h3>
                <p className="text-xs text-mist mt-0.5">
                  {language === "te"
                    ? "పూర్తి సంభాషణలు తేదీ, సమయం మరియు పథకాల సమాచారంతో భద్రపరచబడ్డాయి."
                    : language === "hi"
                    ? "तारीख, समय और संपूर्ण योजना विवरण के साथ सुरक्षित की गई बातचीत।"
                    : "Complete conversations saved chronologically with dates, timestamps, and full scheme responses."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {chatSessions.length > 0 && (
                  <>
                    <span className="text-xs font-semibold text-cyber glass px-2.5 py-1 rounded-lg border border-cyber/20">
                      {chatSessions.length} {language === "te" ? "సంభాషణలు" : language === "hi" ? "बातचीत" : "conversations"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            language === "te"
                              ? "సేవ్ చేసిన సంభాషణలన్నీ తొలగించాలా?"
                              : "Are you sure you want to clear all saved conversations?"
                          )
                        ) {
                          clearAllChatSessions();
                        }
                      }}
                      className="text-xs text-red-300 hover:text-red-200 px-3 py-1 rounded-lg glass border border-red-500/20 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                      {language === "te" ? "అన్నీ తొలగించండి" : language === "hi" ? "सभी हटाएं" : "Clear All"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* FULL SAVED CHAT SESSIONS */}
            <div className="space-y-3">
              {chatSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 glass rounded-2xl border border-white/5 border-dashed">
                  <span className="text-4xl mb-3 opacity-50">💬</span>
                  <p className="text-sm text-mist/80 mb-1">
                    {language === "te" ? "ఇంకా సంభాషణలు ఏవీ సేవ్ చేయబడలేదు." : "No saved conversations yet."}
                  </p>
                  <p className="text-xs text-mist/60 mb-4 text-center max-w-sm">
                    {language === "te"
                      ? "భారత్ వాయిస్ AI తో మీరు మాట్లాడే ప్రతి సంభాషణ తేదీ మరియు సమయంతో ఇక్కడ సేవ్ చేయబడుతుంది."
                      : "Every voice conversation with BharathVoice AI will be securely saved here along with the date and time."}
                  </p>
                  <Link
                    href={`/assistant?lang=${language}`}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-saffron to-gulal text-white text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all"
                  >
                    {language === "te"
                      ? "మొదటి సంభాషణ ప్రారంభించండి →"
                      : language === "hi"
                      ? "पहली बातचीत शुरू करें →"
                      : "Start Your First Conversation →"}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                          <span>{language === "te" ? "పూర్తి చాట్ తెరవండి 💬" : language === "hi" ? "पूरी बातचीत खोलें 💬" : "Open Full Chat 💬"}</span>
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
