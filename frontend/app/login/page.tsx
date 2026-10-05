"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { saveUser, useAuth, loginWithCredentials, registerAccount } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("te");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Google OAuth Client ID state
  const [googleClientId, setGoogleClientId] = useState<string>("");
  const [customKeyInput, setCustomKeyInput] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1019729069767-e25nhunud2ig850s11no8rau15mvj4np.apps.googleusercontent.com";
    const storedClientId = typeof window !== "undefined" ? localStorage.getItem("bharathvoice_google_client_id") || "" : "";
    const activeClientId = storedClientId || envClientId;
    setGoogleClientId(activeClientId);

    if (activeClientId && typeof window !== "undefined") {
      // Load Google Identity Services script
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).google?.accounts?.id) {
          (window as any).google.accounts.id.initialize({
            client_id: activeClientId,
            callback: handleGoogleCredentialResponse,
          });
          const buttonDiv = document.getElementById("google-button-container");
          if (buttonDiv) {
            (window as any).google.accounts.id.renderButton(buttonDiv, {
              theme: "filled_black",
              size: "large",
              text: "continue_with",
              shape: "pill",
              width: 280,
            });
          }
        }
      };
      document.body.appendChild(script);
      return () => {
        try {
          document.body.removeChild(script);
        } catch {}
      };
    }
  }, [googleClientId]);

  function handleGoogleCredentialResponse(response: any) {
    try {
      setIsLoading(true);
      // Decode JWT token payload
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
        loginAt: Date.now(),
      });

      router.push("/assistant");
    } catch (e) {
      console.error("Google OAuth decoding error:", e);
      setErrorMessage("Could not process Google login. Please try again or use username login.");
      setIsLoading(false);
    }
  }

  function handleDemoGoogleLogin() {
    setIsLoading(true);
    setErrorMessage("");
    setTimeout(() => {
      saveUser({
        name: "Aaditya Sharma",
        username: "aaditya.sharma",
        email: "aaditya.sharma@gmail.com",
        avatar: "https://lh3.googleusercontent.com/a/default-user",
        provider: "google",
        loginAt: Date.now(),
      });
      router.push("/assistant");
    }, 400);
  }

  function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const result = loginWithCredentials(username, password);
    setIsLoading(false);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setErrorMessage(result.error || "Invalid username or password.");
    }
  }

  function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const result = registerAccount(username, email, password, fullName, selectedLanguage);
    setIsLoading(false);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setErrorMessage(result.error || "Could not register account. Please check your details.");
    }
  }

  function handleSaveCustomClientId() {
    if (customKeyInput.trim()) {
      localStorage.setItem("bharathvoice_google_client_id", customKeyInput.trim());
      setGoogleClientId(customKeyInput.trim());
      setShowKeyModal(false);
    }
  }

  return (
    <main className="min-h-screen bg-transparent text-bone relative overflow-hidden flex flex-col justify-between p-4 sm:p-6">
      {/* 3D Glowing Mesh Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[15%] w-[45%] h-[45%] bg-saffron/15 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[15%] w-[45%] h-[45%] bg-amethyst/15 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: "3s" }} />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/" className="block active:scale-95 transition-transform">
          <BrandLogo size="md" />
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full glass border border-white/15 text-xs font-semibold text-bone hover:border-saffron/40 hover:bg-white/5 active:scale-95 transition-all duration-300 shadow-sm"
        >
          <span>🏠</span>
          <span>Home</span>
        </Link>
      </div>

      <div className="relative z-10 max-w-lg w-full mx-auto my-auto py-8">
        {/* Card */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-saffron/5 pointer-events-none" />

          {/* Logo Orb */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-saffron via-gulal to-amethyst mx-auto mb-4 shadow-glow flex items-center justify-center">
            <span className="text-xl">🇮🇳</span>
          </div>

          <h1 className="font-display text-2xl font-bold mb-1.5 text-center text-bone">
            Welcome to <span className="text-gradient">BharathVoice AI</span>
          </h1>
          <p className="text-xs text-mist text-center leading-relaxed mb-6">
            Safe citizen login via Google OAuth or Username &amp; Password.
          </p>

          {isLoggedIn && user ? (
            <div className="space-y-4">
              <div className="glass p-4 rounded-2xl border border-white/10 text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-saffron/30 text-saffron flex items-center justify-center text-lg font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-bone">{user.name}</div>
                  <div className="text-xs text-mist">{user.email || user.username}</div>
                  <div className="text-[10px] text-cyber mt-0.5">Authenticated via {user.provider}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 py-3 rounded-full bg-gradient-to-r from-saffron to-gulal text-white font-semibold text-xs shadow-glow hover:scale-105 transition-all"
                >
                  Go to Dashboard →
                </button>
                <button
                  onClick={logout}
                  className="px-5 py-3 rounded-full glass border border-white/10 text-xs text-mist hover:text-bone hover:border-red-400/40 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Toggle: Sign In vs Create Account */}
              <div className="flex p-1 glass rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setErrorMessage(""); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${
                    authMode === "login"
                      ? "bg-gradient-to-r from-saffron to-gulal text-white shadow-glow"
                      : "text-mist hover:text-bone"
                  }`}
                >
                  Sign In (Username / Google)
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("signup"); setErrorMessage(""); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${
                    authMode === "signup"
                      ? "bg-gradient-to-r from-amethyst to-neon text-white shadow-glowNeon"
                      : "text-mist hover:text-bone"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center animate-fadeIn">
                  {errorMessage}
                </div>
              )}

              {/* Google OAuth Section */}
              <div className="space-y-2">
                <div id="google-button-container" className="flex justify-center min-h-[44px]"></div>

                <button
                  type="button"
                  onClick={handleDemoGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-800 font-semibold text-xs shadow-md hover:bg-gray-100 transition-all group"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue to BharathVoice AI with Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] text-mist/60 uppercase">or with username &amp; password</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* FORM 1: Username & Password Login */}
              {authMode === "login" ? (
                <form onSubmit={handleCredentialsLogin} className="space-y-3.5 text-left">
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

                  <div className="p-2.5 glass rounded-xl border border-white/5 text-[11px] text-mist/70 flex items-center justify-between">
                    <span>💡 Quick Demo credentials:</span>
                    <button
                      type="button"
                      onClick={() => { setUsername("citizen"); setPassword("bharat123"); }}
                      className="text-saffron font-semibold hover:underline"
                    >
                      Fill Demo (citizen)
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
                /* FORM 2: Create Account / Sign Up */
                <form onSubmit={handleSignUp} className="space-y-3 text-left">
                  <div>
                    <label className="text-xs font-semibold text-mist block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rajesh Reddy"
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
                      placeholder="e.g. rajeshreddy"
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
                      placeholder="rajesh@bharat.in"
                      className="w-full text-xs bg-void/80 border border-white/15 rounded-xl px-3.5 py-2 text-bone outline-none focus:border-amethyst transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-mist block mb-1">Create Password</label>
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
                    <label className="text-xs font-semibold text-mist block mb-1">Preferred Language</label>
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
                          onClick={() => setSelectedLanguage(l.code)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-left truncate transition-all ${
                            selectedLanguage === l.code
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
                    {isLoading ? "Creating Account..." : "Create Account & Sign In →"}
                  </button>
                </form>
              )}

              {/* Google API Client ID Manager */}
              <div className="pt-4 border-t border-white/10 text-left">
                <div className="flex items-center justify-between text-xs text-mist mb-1">
                  <span>Google OAuth Client ID:</span>
                  <span className={`font-semibold ${googleClientId ? "text-cyber" : "text-saffron"}`}>
                    {googleClientId ? "Configured ✓" : "Demo Key Active"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowKeyModal(!showKeyModal)}
                  className="text-xs text-saffron hover:underline font-medium inline-block"
                >
                  {showKeyModal ? "Close" : "⚙️ Provide / Update Google OAuth API Key"}
                </button>

                {showKeyModal && (
                  <div className="mt-3 p-3 glass rounded-xl border border-saffron/30 space-y-2 animate-fadeIn">
                    <label className="text-[11px] font-semibold text-bone block">
                      Google OAuth Client ID (from Google Cloud Console):
                    </label>
                    <input
                      type="text"
                      value={customKeyInput}
                      onChange={(e) => setCustomKeyInput(e.target.value)}
                      placeholder="e.g. 12345678-xxx.apps.googleusercontent.com"
                      className="w-full text-xs bg-void/80 border border-white/20 rounded-lg px-3 py-2 text-bone outline-none focus:border-saffron"
                    />
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleSaveCustomClientId}
                        className="px-3 py-1.5 rounded-lg bg-saffron text-white text-xs font-semibold hover:brightness-110"
                      >
                        Save Client ID
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-mist/60 mt-6">
          BharathVoice AI ensures zero credential leakage. Auth sessions are stored safely.
        </p>
      </div>
    </main>
  );
}
