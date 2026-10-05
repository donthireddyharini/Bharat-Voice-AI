"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const MOBILE_NAV_ITEMS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/services", label: "Services", icon: "🏛️" },
  { href: "/assistant", label: "Voice AI", icon: "🎙️", highlight: true },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong backdrop-blur-2xl border-t border-white/10 px-1.5 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
      style={{ paddingBottom: "max(0.4rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-2xl transition-all duration-300 relative select-none active:scale-95 ${
                isActive
                  ? "text-saffron font-bold"
                  : "text-mist hover:text-bone hover:bg-white/5"
              }`}
            >
              {item.highlight ? (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg -mt-3.5 mb-0.5 shadow-lg transition-transform duration-300 ${
                    isActive
                      ? "bg-gradient-to-tr from-saffron via-gulal to-amethyst text-white shadow-glow scale-110"
                      : "bg-white/15 text-bone border border-white/20"
                  }`}
                >
                  {item.icon}
                </div>
              ) : (
                <span className={`text-lg mb-0.5 transition-transform ${isActive ? "scale-115" : ""}`}>
                  {item.icon}
                </span>
              )}
              
              <span className={`text-[10px] tracking-tight leading-none ${isActive ? "text-saffron font-bold" : "text-mist font-medium"}`}>
                {item.label}
              </span>

              {isActive && !item.highlight && (
                <span className="w-1.5 h-1.5 rounded-full bg-saffron mt-1 shadow-glow" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
