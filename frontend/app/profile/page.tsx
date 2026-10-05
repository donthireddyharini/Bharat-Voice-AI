"use client";

import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ProfilePanel from "@/components/ProfilePanel";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-transparent text-bone relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-amethyst/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <Sidebar />
      </div>
      
      <main className="flex-1 px-3 sm:px-8 py-4 sm:py-6 relative z-10 min-h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2.5 mb-6 pb-3 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="md:hidden block shrink-0">
              <BrandLogo size="sm" showText={false} />
            </Link>
            <div>
              <h1 className="font-display font-bold text-lg sm:text-2xl text-bone">Citizen Profile</h1>
              <p className="text-mist text-[11px] sm:text-xs">Manage preferences, identity, and personal records</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
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

        <div className="max-w-4xl mx-auto glass-strong rounded-2xl sm:rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] overflow-hidden">
          <ProfilePanel />
        </div>
      </main>
    </div>
  );
}
