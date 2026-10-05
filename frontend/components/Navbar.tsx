"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import BrandLogo from "@/components/BrandLogo";
import DashboardLanguageSelector from "@/components/DashboardLanguageSelector";
import { useLanguage } from "@/lib/useLanguage";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 glass backdrop-blur-2xl border-b border-white/10 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">

        {/* LEFT: Brand Logo */}
        <Link href="/" className="block active:scale-[0.98] transition-transform shrink-0">
          <BrandLogo size="md" />
        </Link>

        {/* RIGHT: Language Selector & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Universal Language Selector directly in header */}
          <DashboardLanguageSelector value={language} onChange={setLanguage} />

          {isLoggedIn ? (
            <>
              {/* Home */}
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/15 text-xs font-semibold text-bone hover:border-saffron/50 hover:bg-white/5 active:scale-95 transition-all shadow-sm"
              >
                <span>🏠</span>
                <span className="hidden sm:inline">{t.navHome}</span>
              </Link>

              {/* Profile badge */}
              {user && (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-white/10 hover:border-saffron/40 active:scale-95 transition-all"
                  title="My Profile"
                >
                  <div className="w-5 h-5 rounded-full bg-saffron/30 text-saffron flex items-center justify-center text-[10px] font-bold shrink-0">
                    {user.name?.charAt(0) || "C"}
                  </div>
                  <span className="text-xs font-medium text-bone max-w-[100px] truncate hidden sm:block">
                    {user.name}
                  </span>
                </Link>
              )}

              {/* Sign Out */}
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-red-500/20 text-xs font-semibold text-red-200 hover:bg-red-500/10 hover:border-red-500/40 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">{t.navSignOut}</span>
              </button>
            </>
          ) : (
            <>
              {/* Guest: Home + Sign In */}
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full glass border border-white/15 text-xs font-semibold text-bone hover:border-saffron/50 hover:bg-white/5 active:scale-95 transition-all"
              >
                <span>🏠</span>
                <span>{t.navHome}</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    if (window.location.pathname === "/") {
                      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: "login" }));
                    } else {
                      window.location.href = "/login";
                    }
                  }
                }}
                className="text-xs font-semibold text-white bg-gradient-to-r from-saffron to-gulal px-4 py-1.5 rounded-full shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t.navSignIn}</span>
                <span>→</span>
              </button>
            </>
          )}
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-saffron/30 to-transparent opacity-70" />
    </header>
  );
}
