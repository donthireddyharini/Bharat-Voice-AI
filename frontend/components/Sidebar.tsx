"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import BrandLogo from "@/components/BrandLogo";
import { useLanguage } from "@/lib/useLanguage";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { href: "/dashboard", label: t.navDashboard, icon: "📊", desc: "Overview & quick actions" },
    { href: "/services", label: t.navServices, icon: "🏛️", desc: "Government schemes & welfare" },
    { href: "/assistant", label: t.navAssistant, icon: "🎙️", desc: "Talk in your language" },
    { href: "/profile", label: t.navProfile, icon: "👤", desc: "Account & preferences" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 shrink-0 border-r border-white/8 min-h-screen px-5 py-6 gap-6 bg-panel/60 backdrop-blur-2xl relative z-10">

      {/* Brand Logo */}
      <Link href="/" className="px-1 block mb-1">
        <BrandLogo size="md" />
      </Link>

      {/* User Mini Card */}
      {user && (
        <div className="glass rounded-2xl px-4 py-3 border border-white/8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron/30 to-amethyst/30 border border-saffron/40 flex items-center justify-center text-sm font-bold text-saffron shrink-0">
            {user.name?.charAt(0) || "C"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-bone truncate">{user.name}</div>
            <div className="text-[10px] text-mist/70 truncate">{user.email}</div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-mist/50 px-3 mb-1">Navigation</div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 group active:scale-[0.97] ${
                isActive
                  ? "bg-gradient-to-r from-saffron/15 via-gulal/8 to-transparent text-bone border border-saffron/25 shadow-[0_0_20px_rgba(255,120,0,0.12)]"
                  : "text-mist hover:bg-white/6 hover:text-bone"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-saffron to-gulal rounded-r-full shadow-glow" />
              )}
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold">{item.label}</span>
                <span className="text-[10px] text-mist/60 font-normal">{item.desc}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
