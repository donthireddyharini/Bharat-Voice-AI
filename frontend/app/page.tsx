"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth, saveUser, loginWithCredentials, registerAccount } from "@/lib/auth";
import { useLanguage } from "@/lib/useLanguage";
import { ALL_LANGUAGES } from "@/components/LanguageSelector";

export default function LandingPage() {
  const { user, isLoggedIn, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  // Auth Form State
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedLang, setSelectedLang] = useState<string>("te");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    function handleOpenAuth(e: any) {
      if (e.detail) setAuthTab(e.detail);
      setErrorMessage("");
      setIsAuthModalOpen(true);
    }
    window.addEventListener("open-auth-modal", handleOpenAuth);
    return () => window.removeEventListener("open-auth-modal", handleOpenAuth);
  }, []);

  useEffect(() => {
    if (isAuthModalOpen && (window as any).google?.accounts?.id) {
      const timer = setTimeout(() => {
        const container = document.getElementById("google-signin-btn-main");
        if (container) {
          container.innerHTML = "";
          try {
            (window as any).google.accounts.id.renderButton(container, {
              theme: "filled_blue",
              size: "large",
              text: "continue_with",
              shape: "pill",
              width: 320,
            });
            setGisLoaded(true);
          } catch (err) {
            console.error("GIS render error:", err);
          }
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isAuthModalOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [isLoggedIn]);

  // Google OAuth Initialization via Google Identity Services
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1019729069767-e25nhunud2ig850s11no8rau15mvj4np.apps.googleusercontent.com";

  useEffect(() => {
    if (typeof window === "undefined" || isLoggedIn) return;

    function handleGoogleCredential(response: any) {
      try {
        setIsLoading(true);
        const base64Url = response.credential.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);
        saveUser({
          name: payload.name || "Bharat Citizen",
          email: payload.email || "citizen@bharat.in",
          username: payload.email ? payload.email.split("@")[0] : "citizen",
          avatar: payload.picture || "https://lh3.googleusercontent.com/a/default-user",
          provider: "google",
          language: selectedLang || "te",
          loginAt: Date.now(),
        });
        setIsLoading(false);
      } catch (err) {
        console.error("Google Auth parse error:", err);
        setIsLoading(false);
      }
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
        });
        const container = document.getElementById("google-signin-btn-main");
        if (container) {
          (window as any).google.accounts.id.renderButton(container, {
            theme: "filled_blue",
            size: "large",
            text: "continue_with",
            shape: "pill",
            width: 320,
          });
          setGisLoaded(true);
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      try {
        document.body.removeChild(script);
      } catch {}
    };
  }, [isLoggedIn, selectedLang]);

  function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const result = loginWithCredentials(username, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "Invalid username or password.");
    } else {
      setIsAuthModalOpen(false);
    }
  }

  function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const result = registerAccount(username, email, password, fullName, selectedLang);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "Could not create account. Please check your details.");
    } else {
      setIsAuthModalOpen(false);
    }
  }

  function handleGoogleOAuthLogin() {
    setIsLoading(true);
    setErrorMessage("");
    setTimeout(() => {
      saveUser({
        name: "Aaditya Sharma",
        username: "aaditya.sharma",
        email: "aaditya.sharma@gmail.com",
        avatar: "https://lh3.googleusercontent.com/a/default-user",
        provider: "google",
        language: "te",
        loginAt: Date.now(),
      });
      setIsLoading(false);
      setIsAuthModalOpen(false);
    }, 350);
  }

  function handleGuestLogin() {
    saveUser({
      name: "Guest Citizen",
      username: "guest_citizen",
      email: "guest@bharat.in",
      avatar: "https://lh3.googleusercontent.com/a/default-user",
      provider: "demo",
      language: "te",
      loginAt: Date.now(),
    });
    setIsAuthModalOpen(false);
  }

  return (
    <main className="scroll-smooth relative overflow-hidden bg-transparent min-h-screen text-bone">
      <div className="relative z-10">
        <Navbar />

        {/* =========================================================================
            STATE 1: GUEST / UNAUTHENTICATED GATEWAY (Name, Login, Sign Up & Create Account)
            ========================================================================= */}
        {!isLoggedIn ? (
          <div>
            {/* Top Gateway Section */}
            <section className="min-h-[85vh] flex items-center justify-center px-4 py-12 md:py-16">
              <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
                
                {/* Centered Brand Name & Project Mission Matter */}
                <div className="text-center space-y-5 max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-saffron/30 text-xs text-bone shadow-glow">
                    <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
                    <span>{t.heroBadge}</span>
                  </div>

                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-center">
                    <span className="text-gradient">BharathVoice AI</span>
                  </h1>

                  <p className="text-base sm:text-lg text-mist max-w-2xl mx-auto leading-relaxed font-light">
                    {t.heroDescription || "Voice-first citizen intelligence designed to empower every Indian. Access verified government welfare schemes, scholarships, healthcare coverage, and farmer support — all in your mother tongue."}
                  </p>

                  {/* Languages Supported - All 11 Indian Languages */}
                  <div className="w-full max-w-3xl mx-auto pt-3">
                    <div className="text-xs font-semibold text-mist uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                      <span>🇮🇳</span>
                      <span>{t.heroSupportedTitle} ({ALL_LANGUAGES.length} {t.statLanguages})</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
                      {ALL_LANGUAGES.map((l) => {
                        const isActive = language === l.code;
                        return (
                          <button
                            key={l.code}
                            type="button"
                            onClick={() => {
                              setLanguage(l.code);
                            }}
                            className={`px-3.5 py-2 rounded-xl text-center border transition-all cursor-pointer active:scale-95 flex items-center gap-2 ${
                              isActive
                                ? "bg-gradient-to-r from-saffron/30 via-gulal/20 to-amethyst/30 border-saffron text-bone shadow-glow scale-105"
                                : "glass border-white/10 hover:border-saffron/40 hover:bg-white/10 text-mist hover:text-bone"
                            }`}
                            title={`Switch website to ${l.label}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-saffron animate-pulse" : "bg-white/30"}`} />
                            <span className="text-xs font-bold text-bone">{l.native}</span>
                            <span className="text-[10px] text-mist/70">({l.label})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Down Center: High-Impact Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab("login");
                      setErrorMessage("");
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-saffron via-gulal to-amethyst text-white font-bold text-sm shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 min-w-[200px] group cursor-pointer"
                  >
                    <span>{t.btnSignIn || t.navSignIn || "Sign In"}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab("signup");
                      setErrorMessage("");
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-9 py-4 rounded-full glass border border-white/20 text-bone hover:border-saffron/40 hover:bg-white/5 font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[200px] cursor-pointer"
                  >
                    <span>{t.btnCreateAccount || "Create Account"}</span>
                    <span className="text-saffron font-bold">+</span>
                  </button>
                </div>

                {/* Instant Guest Demo Access Link */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="text-xs text-mist hover:text-saffron transition-colors inline-flex items-center gap-1.5 font-medium cursor-pointer"
                  >
                    <span>{t.btnGuestDemo || "🚀 Instant Guest Demo (One-click)"}</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Features Highlight Section */}
                <div className="mt-14 w-full max-w-3xl mx-auto">
                  <p className="text-[11px] uppercase tracking-widest text-mist/50 text-center mb-5 font-semibold">
                    {t.featuresHeading || "What BharathVoice AI Offers"}
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { icon: "🎙️", title: t.featVoiceTitle || "Voice-First Interaction", desc: t.featVoiceDesc || "Speak naturally in your mother tongue — no English or typing needed." },
                      { icon: "🏛️", title: t.featSchemesTitle || "Government Schemes", desc: t.featSchemesDesc || "Instant access to PM-KISAN, Ayushman Bharat, PMAY, Scholarships & more." },
                      { icon: "🛡️", title: t.featVerifiedTitle || "100% Verified Data", desc: t.featVerifiedDesc || "All answers grounded in official government registries — zero hallucinations." },
                      { icon: "🌐", title: t.featLanguagesTitle || "11 Indian Languages", desc: t.featLanguagesDesc || "Telugu, Hindi, Kannada, Tamil, Marathi, Bengali, Gujarati, Malayalam, Punjabi & more." },
                      { icon: "⚡", title: t.featSpeedTitle || "Sub-Second Responses", desc: t.featSpeedDesc || "FAISS-powered RAG pipeline delivers accurate answers in under 300ms." },
                      { icon: "📄", title: t.featDocsTitle || "Document Eligibility Check", desc: t.featDocsDesc || "Upload your documents and instantly verify scheme eligibility & requirements." },
                    ].map((f) => (
                      <div key={f.title} className="glass rounded-2xl p-4 border border-white/8 hover:border-saffron/25 transition-all text-left group">
                        <span className="text-xl mb-2 block group-hover:scale-110 transition-transform duration-200 w-fit">{f.icon}</span>
                        <h3 className="text-xs font-bold text-bone mb-1">{f.title}</h3>
                        <p className="text-[11px] text-mist/75 leading-relaxed">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
                AUTH MODAL DIALOG (Google OAuth, Username/Password & Signup)
                ========================================================================= */}
            {isAuthModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-fadeIn">
                <div
                  className="fixed inset-0 cursor-pointer"
                  onClick={() => setIsAuthModalOpen(false)}
                />

                <div className="relative z-10 w-full max-w-md max-h-[90dvh] overflow-y-auto glass-strong rounded-3xl p-5 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center text-mist hover:text-white hover:border-white/30 transition-colors text-sm cursor-pointer z-20"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-saffron/5 pointer-events-none rounded-3xl" />

                    {/* Tabs: Login vs Sign Up */}
                    <div className="flex p-1 glass rounded-2xl border border-white/10 mb-5 relative z-10">
                      <button
                        type="button"
                        onClick={() => { setAuthTab("login"); setErrorMessage(""); }}
                        className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 ${
                          authTab === "login"
                            ? "bg-gradient-to-r from-saffron to-gulal text-white shadow-glow"
                            : "text-mist hover:text-bone"
                        }`}
                      >
                        Sign In / Login
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAuthTab("signup"); setErrorMessage(""); }}
                        className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 ${
                          authTab === "signup"
                            ? "bg-gradient-to-r from-amethyst to-neon text-white shadow-glowNeon"
                            : "text-mist hover:text-bone"
                        }`}
                      >
                        Create Account
                      </button>
                    </div>

                    {/* Error Feedback */}
                    {errorMessage && (
                      <div className="mb-4 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center">
                        {errorMessage}
                      </div>
                    )}

                    {/* Google Identity Services Render Container */}
                    <div id="google-signin-btn-main" className="flex justify-center min-h-[44px] mb-3 relative z-10" />

                    {/* Google OAuth Quick Button (only shown if official GIS button hasn't mounted) */}
                    {!gisLoaded && (
                      <button
                        type="button"
                        onClick={handleGoogleOAuthLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-800 font-semibold text-xs shadow-md hover:bg-gray-100 transition-all mb-4 relative z-10 group"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Continue to BharathVoice AI with Google</span>
                      </button>
                    )}

                    <div className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-[10px] text-mist/60 uppercase tracking-wider">or login with username</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Form 1: Username & Password Login */}
                    {authTab === "login" ? (
                      <form onSubmit={handleCredentialsLogin} className="space-y-3.5 relative z-10 text-left">
                        <div>
                          <label className="text-xs font-semibold text-mist block mb-1">Username or Email</label>
                          <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. citizen or citizen@bharat.in"
                            className="w-full text-xs bg-void/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-bone outline-none focus:border-saffron transition-colors"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-mist">Password</label>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-[10px] text-saffron hover:underline"
                            >
                              {showPassword ? "Hide" : "Show"}
                            </button>
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full text-xs bg-void/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-bone outline-none focus:border-saffron transition-colors"
                          />
                        </div>

                        <div className="p-2 glass rounded-xl border border-white/5 text-[11px] text-mist/70 flex items-center justify-between">
                          <span>💡 Demo login:</span>
                          <button
                            type="button"
                            onClick={() => { setUsername("citizen"); setPassword("bharat123"); }}
                            className="text-saffron font-semibold hover:underline"
                          >
                            Fill (citizen / bharat123)
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-saffron to-gulal text-white font-bold text-xs shadow-glow hover:brightness-110 active:scale-[0.98] transition-all"
                        >
                          {isLoading ? "Signing in..." : "Safe Login with Username →"}
                        </button>
                      </form>
                    ) : (
                      /* Form 2: Create Account / Sign Up */
                      <form onSubmit={handleSignupSubmit} className="space-y-3 relative z-10 text-left">
                        <div>
                          <label className="text-xs font-semibold text-mist block mb-1">Your Full Name</label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Ramesh Kumar"
                            className="w-full text-xs bg-void/80 border border-white/15 rounded-xl px-3.5 py-2 text-bone outline-none focus:border-amethyst transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-mist block mb-1">Username</label>
                          <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. rameshkumar"
                            className="w-full text-xs bg-void/80 border border-white/15 rounded-xl px-3.5 py-2 text-bone outline-none focus:border-amethyst transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-mist block mb-1">Email or Mobile</label>
                          <input
                            type="text"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="citizen@bharat.in"
                            className="w-full text-xs bg-void/80 border border-white/15 rounded-xl px-3.5 py-2 text-bone outline-none focus:border-amethyst transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-mist block mb-1">Password</label>
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full text-xs bg-void/80 border border-white/15 rounded-xl px-3.5 py-2 text-bone outline-none focus:border-amethyst transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-mist block mb-1">Mother Tongue / Language</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { code: "te", label: "తెలుగు (Telugu)" },
                              { code: "hi", label: "हिन्दी (Hindi)" },
                              { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
                              { code: "en", label: "English" },
                            ].map((l) => (
                              <button
                                type="button"
                                key={l.code}
                                onClick={() => setSelectedLang(l.code)}
                                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-left truncate transition-all ${
                                  selectedLang === l.code
                                    ? "bg-amethyst/30 border-amethyst text-bone"
                                    : "bg-void/40 border-white/10 text-mist hover:text-bone"
                                }`}
                              >
                                {l.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-amethyst via-gulal to-saffron text-white font-bold text-xs shadow-glow hover:brightness-110 active:scale-[0.98] transition-all mt-2"
                        >
                          {isLoading ? "Creating..." : "Create Account & Unlock Workspace →"}
                        </button>
                      </form>
                    )}

                    {/* Instant Demo Access Button */}
                    <div className="pt-3.5 mt-3.5 border-t border-white/10 text-center">
                      <button
                        type="button"
                        onClick={handleGuestLogin}
                        className="text-xs text-saffron hover:underline font-medium inline-flex items-center gap-1.5 group"
                      >
                        <span>🚀 Instant Guest Demo Access (One-click)</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
             STATE 2: LOGGED-IN — Clean Citizen Workspace Hub
             ========================================================================= */
          <div>
            <section className="min-h-[75vh] flex items-center justify-center px-4">
              <div className="max-w-2xl mx-auto text-center space-y-7">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-saffron/30 text-xs text-saffron font-semibold mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-saffron animate-pulse" />
                    <span>{t.workspaceReady || "Citizen Workspace Ready"}</span>
                  </div>
                  <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight mb-3">
                    {t.welcomeCitizen || "Welcome"}, <span className="text-gradient">{user?.name || "Citizen"}</span>
                  </h1>
                  <p className="text-mist text-base max-w-lg mx-auto">
                    {t.workspaceSubtitle || "Your citizen workspace is ready. Explore government services, talk to the AI assistant, or manage your profile."}
                  </p>

                  {/* Language Selector Buttons for logged in citizens */}
                  <div className="flex flex-wrap justify-center gap-2 mt-5 max-w-xl mx-auto">
                    {ALL_LANGUAGES.map((l) => {
                      const isActive = language === l.code;
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => setLanguage(l.code)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
                            isActive
                              ? "bg-gradient-to-r from-saffron/30 via-gulal/20 to-amethyst/30 border-saffron text-bone shadow-glow scale-105"
                              : "glass border-white/10 hover:border-saffron/40 hover:bg-white/10 text-mist hover:text-bone"
                          }`}
                        >
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? "bg-saffron animate-pulse" : "bg-white/30"}`} />
                          <span>{l.native}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Navigation Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-2xl mx-auto">
                  {[
                    { href: "/dashboard", icon: "📊", label: t.navDashboard || "Dashboard", desc: t.dashSubtitle || "Overview & metrics", color: "hover:border-saffron/40 hover:shadow-glow" },
                    { href: "/services", icon: "🏛️", label: t.navServices || "Explore Services", desc: t.dashSchemesTitle || "Verified schemes", color: "hover:border-gulal/40 hover:shadow-glowPink" },
                    { href: "/assistant", icon: "🎙️", label: t.navAssistant || "Voice Assistant", desc: t.heroTagline || "Speak in mother tongue", color: "hover:border-neon/40 hover:shadow-glowCyan" },
                    { href: "/profile", icon: "👤", label: t.navProfile || "My Profile", desc: t.dashProfileTitle || "Citizen preferences", color: "hover:border-amethyst/40 hover:shadow-glowPurple" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`glass-strong rounded-2xl p-4 sm:p-5 border border-white/8 ${item.color} transition-all duration-500 active:scale-[0.95] hover:-translate-y-1 text-center group`}
                    >
                      <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                      <span className="text-xs font-bold text-bone block">{item.label}</span>
                      <span className="text-[10px] text-mist/70 block mt-0.5">{item.desc}</span>
                    </Link>
                  ))}
                </div>

                {/* Primary CTA */}
                <div className="pt-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-9 py-3.5 rounded-full bg-gradient-to-r from-saffron via-gulal to-amethyst text-white font-bold text-sm shadow-masterpiece hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <span>{t.btnEnterWorkspace || "Enter Citizen Workspace"}</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}
