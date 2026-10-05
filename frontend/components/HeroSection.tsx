"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AIOrb from "./AIOrb";
import Interactive3DScene from "./Interactive3DScene";
import { AssistantState, Language } from "@/lib/types";
import { speak, stopSpeaking, startListening, playAssistantChime } from "@/lib/speech";
import { useLanguage } from "@/lib/useLanguage";
import { ALL_LANGUAGES } from "./LanguageSelector";

export default function HeroSection() {
  const { language, setLanguage, t } = useLanguage();
  const [orbState, setOrbState] = useState<AssistantState>("idle");
  const [typedText, setTypedText] = useState("");
  const [viewMode, setViewMode] = useState<"orb" | "globe">("orb");
  const [statusMessage, setStatusMessage] = useState("");

  const fullText = t.heroTagline || "AI that speaks Bharat's languages.";

  useEffect(() => {
    let i = 0;
    setTypedText("");
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 45);
    return () => clearInterval(typingInterval);
  }, [fullText]);

  const handleLanguageSelect = (langCode: Language) => {
    stopSpeaking();
    setLanguage(langCode);
    setOrbState("idle");
    setStatusMessage("");
  };

  const handlePlayPronunciation = (langCode: Language, label: string) => {
    stopSpeaking();
    setLanguage(langCode);
    setOrbState("speaking");
    setStatusMessage(`Playing natural ${label} voice preview...`);
    const greeting = t.heroSpeakingGreeting || "Namaste! Welcome to BharathVoice AI.";
    speak(greeting, langCode, () => {
      setOrbState("idle");
      setStatusMessage("");
    });
  };

  const handleStateClick = (state: AssistantState) => {
    stopSpeaking();
    setOrbState(state);

    if (state === "idle") {
      setStatusMessage("Assistant is standing by.");
    } else if (state === "listening") {
      setStatusMessage("Listening... Speak into your microphone now.");
      playAssistantChime("start");
      startListening(
        language,
        (transcript) => {
          setStatusMessage(`Heard: "${transcript}"`);
          setOrbState("understanding");
          setTimeout(() => {
            setOrbState("speaking");
            const reply = language === "te"
              ? `మీరు అడిగారు: "${transcript}". ప్రభుత్వ సంక్షేమ వివరాలు అందిస్తున్నాను.`
              : language === "hi"
              ? `आपने पूछा: "${transcript}". सरकारी योजनाओं का विवरण प्रस्तुत है।`
              : `You asked: "${transcript}". Retrieving official government records.`;
            speak(reply, language, () => {
              setOrbState("idle");
              setStatusMessage("");
            });
          }, 600);
        },
        (err) => {
          setStatusMessage("Microphone closed or silence detected.");
          setOrbState("idle");
        },
        () => {
          setOrbState("idle");
        }
      );
    } else if (state === "understanding") {
      setStatusMessage("Analyzing citizen context and query intent...");
      const reply = language === "te"
        ? "నేను మీ అర్హతలు మరియు ప్రభుత్వ మార్గదర్శకాలను విశ్లేషిస్తున్నాను."
        : language === "hi"
        ? "मैं आपकी पात्रता और सरकारी दिशानिर्देशों का विश्लेषण कर रहा हूँ।"
        : "Analyzing your eligibility criteria and official scheme guidelines.";
      speak(reply, language, () => {
        setOrbState("idle");
        setStatusMessage("");
      });
    } else if (state === "generating") {
      setStatusMessage("Synthesizing verified RAG knowledge base data...");
      const reply = language === "te"
        ? "జ్ఞాన బాండాగారం నుండి అధికారిక సమాచారాన్ని సంగ్రహిస్తున్నాను."
        : language === "hi"
        ? "सत्यापित डेटाबेस से आधिकारिक जानकारी तैयार कर रहा हूँ।"
        : "Synthesizing verified data from government portals.";
      speak(reply, language, () => {
        setOrbState("idle");
        setStatusMessage("");
      });
    } else if (state === "speaking") {
      setStatusMessage("Streaming high-definition Neural voice response...");
      speak(
        t.heroSpeakingGreeting,
        language,
        () => {
          setOrbState("idle");
          setStatusMessage("");
        }
      );
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-void text-white font-sans pt-16 sm:pt-20">
      {/* Interactive 3D Ambient Canvas in Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-35">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-saffron/20 blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[30%] -right-[10%] w-[45%] h-[45%] rounded-full bg-amethyst/20 blur-[130px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-gulal/15 blur-[160px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      {/* Floating 3D Star Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-40 animate-particleFloat"
            style={{
              width: (i % 3) + 2 + "px",
              height: (i % 3) + 2 + "px",
              left: ((i * 17) % 100) + "%",
              top: ((i * 23) % 100) + "%",
              animationDuration: 4 + (i % 5) + "s",
              animationDelay: (i % 4) * 0.5 + "s",
              boxShadow: "0 0 8px 1px rgba(0, 212, 255, 0.4)",
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 mx-auto px-4 lg:px-8 py-12 sm:py-16 flex flex-col items-center text-center">
        
        {/* Track Badge */}
        <div className="mb-6 sm:mb-8 inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-full glass border border-saffron/30 shadow-[0_0_25px_rgba(255,122,61,0.2)] backdrop-blur-md relative overflow-hidden group cursor-default">
          <div className="absolute inset-0 bg-gradient-to-r from-saffron/20 via-gulal/20 to-amethyst/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative z-10 text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide text-bone uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-saffron animate-ping" />
            {t.heroBadge}
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4 sm:mb-6 drop-shadow-2xl">
          <span className="text-gradient">
            BharathVoice AI
          </span>
        </h1>

        {/* Typewriter Tagline */}
        <p className="text-base sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-10 min-h-8 font-light flex items-center justify-center space-x-1 px-2">
          <span>{typedText}</span>
          <span className="w-0.5 h-5 sm:h-6 bg-saffron animate-pulse" />
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 mb-10 sm:mb-12 w-full max-w-sm sm:max-w-none justify-center">
          <Link 
            href={`/assistant?lang=${language}`}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-saffron via-gulal to-amethyst text-white font-bold text-base sm:text-lg shadow-[0_0_35px_rgba(255,122,61,0.45)] hover:shadow-[0_0_50px_rgba(255,122,61,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>{t.heroCtaTalk}</span>
            <span className="text-xs sm:text-sm bg-white/20 px-2 py-0.5 rounded-full">Live</span>
          </Link>
          <Link 
            href="/about"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full glass text-white font-semibold text-base sm:text-lg border border-white/20 hover:border-saffron/50 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center"
          >
            {t.heroCtaAbout}
          </Link>
        </div>

        {/* Supported Languages - ALL 11 INDIAN LANGUAGES */}
        <div className="w-full max-w-4xl mx-auto mb-12 sm:mb-16">
          <div className="text-xs font-semibold text-mist uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
            <span>🇮🇳</span>
            <span>{t.heroSupportedTitle} (11 Languages)</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
            {ALL_LANGUAGES.map((lang) => {
              const isActive = language === lang.code;
              return (
                <button 
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95 ${
                    isActive
                      ? "bg-gradient-to-r from-saffron/30 via-gulal/25 to-amethyst/30 border-saffron text-bone shadow-[0_0_25px_rgba(255,122,61,0.4)] scale-105 border-2"
                      : "glass-strong border border-white/10 text-mist hover:border-saffron/50 hover:bg-white/10 hover:text-bone hover:-translate-y-0.5"
                  }`}
                  title={`Switch entire site to ${lang.label}`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? "bg-saffron animate-pulse" : "bg-white/40"}`} />
                  <span className="font-bold">{lang.native}</span>
                  <span className="text-[10px] opacity-70 hidden sm:inline">({lang.label})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive 3D Showcase Container */}
        <div className="relative w-full max-w-3xl mx-auto mb-16 p-6 md:p-8 rounded-3xl glass-strong border border-white/15 shadow-[0_12px_45px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-saffron/5 via-transparent to-amethyst/10 pointer-events-none" />

          {/* Mode Switcher: 3D AI Voice Orb vs 3D Neural Globe */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4 border-b border-white/10 pb-4">
            <div className="text-left">
              <h3 className="text-xl md:text-2xl font-bold text-bone flex items-center gap-2">
                <span>{t.heroExperienceTitle}</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyber/20 text-cyber border border-cyber/30">
                  Neural Voice Engine
                </span>
              </h3>
              <p className="text-xs md:text-sm text-mist mt-1">
                {t.heroExperienceSubtitle}
              </p>
            </div>

            <div className="flex items-center p-1 glass rounded-2xl border border-white/10">
              <button
                onClick={() => setViewMode("orb")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  viewMode === "orb"
                    ? "bg-gradient-to-r from-saffron to-gulal text-white shadow-glow"
                    : "text-mist hover:text-bone"
                }`}
              >
                {t.heroOrbBtn}
              </button>
              <button
                onClick={() => setViewMode("globe")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  viewMode === "globe"
                    ? "bg-gradient-to-r from-amethyst to-neon text-white shadow-glowNeon"
                    : "text-mist hover:text-bone"
                }`}
              >
                {t.heroGlobeBtn}
              </button>
            </div>
          </div>

          {/* 3D Viewport */}
          <div className="relative flex flex-col items-center justify-center min-h-[340px]">
            {viewMode === "orb" ? (
              <div className="w-full flex flex-col items-center">
                <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
                  <AIOrb state={orbState} size="lg" />
                </div>

                {statusMessage && (
                  <div className="mb-4 text-xs font-medium text-cyber bg-void/60 px-4 py-1.5 rounded-full border border-cyber/30 animate-fadeIn">
                    {statusMessage}
                  </div>
                )}

                {/* State selector pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {(["listening", "understanding", "generating", "speaking", "idle"] as AssistantState[]).map((state) => (
                    <button
                      key={state}
                      onClick={() => handleStateClick(state)}
                      className={`px-4 py-2 rounded-xl font-semibold text-xs tracking-wide transition-all duration-300 capitalize flex items-center gap-1.5 ${
                        orbState === state 
                          ? "bg-saffron text-white shadow-[0_0_20px_rgba(255,122,61,0.5)] scale-105" 
                          : "glass border border-white/15 text-mist hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      {state === "listening" && "🎤 "}
                      {state === "understanding" && "🧠 "}
                      {state === "generating" && "⚡ "}
                      {state === "speaking" && "🔊 "}
                      {state === "idle" && "⏹️ "}
                      {state}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-[360px] rounded-2xl overflow-hidden glass border border-white/10 relative">
                <Interactive3DScene interactive={true} showLabels={true} />
              </div>
            )}

            {/* Live Regional Voice Test Buttons across languages */}
            <div className="pt-6 border-t border-white/10 w-full">
              <div className="text-xs text-mist font-medium mb-3 flex items-center justify-center gap-2">
                <span>{t.heroPronunciationTitle}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
                {[
                  { code: "te" as Language, label: "తెలుగు (Telugu)" },
                  { code: "hi" as Language, label: "हिन्दी (Hindi)" },
                  { code: "kn" as Language, label: "ಕನ್ನಡ (Kannada)" },
                  { code: "ta" as Language, label: "தமிழ் (Tamil)" },
                  { code: "mr" as Language, label: "मराठी (Marathi)" },
                  { code: "bn" as Language, label: "বাংলা (Bengali)" },
                  { code: "gu" as Language, label: "ગુજરાતી (Gujarati)" },
                  { code: "ml" as Language, label: "മലയാളം (Malayalam)" },
                  { code: "pa" as Language, label: "ਪੰਜਾਬੀ (Punjabi)" },
                  { code: "or" as Language, label: "ଓଡ଼ିଆ (Odia)" },
                  { code: "en" as Language, label: "English (India)" },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => handlePlayPronunciation(item.code, item.label)}
                    className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold glass border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                      language === item.code
                        ? "border-saffron bg-saffron/20 text-white shadow-glow"
                        : "border-white/15 hover:border-saffron/40 hover:bg-white/10 text-mist hover:text-bone"
                    }`}
                  >
                    <span>🔊</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl mx-auto border-t border-white/10 pt-10">
          {[
            { label: t.statLanguages, value: t.statLanguagesVal },
            { label: t.statCategories, value: t.statCategoriesVal },
            { label: t.statLatency, value: t.statLatencyVal },
            { label: t.statGrounding, value: t.statGroundingVal },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center group">
              <div className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-bone via-saffron to-amethyst mb-1 group-hover:scale-105 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-mist uppercase tracking-widest text-center">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
